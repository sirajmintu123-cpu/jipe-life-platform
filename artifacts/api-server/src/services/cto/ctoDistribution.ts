import { db } from "@workspace/db";
import {
  usersTable,
  walletsTable,
  transactionsTable,
  ctoMonthlyPoolsTable,
  ctoDistributionLogsTable,
} from "@workspace/db";

import {
  eq,
  and,
} from "drizzle-orm";

import {
  createHistory,
  getActiveCycle,
  updateHistory,
  completeHistory,
} from "./ctoHistory";

/* ============================================================
   Interfaces
============================================================ */

export interface EligibleMember {
  id: number;
  memberId: string;
  name: string;
  package: "starter" | "smart" | "silver" | "gold";
  packageCost: number;
  ctoTotalReceived: number;
}

export interface DistributionResult {
  package: "starter" | "smart" | "silver" | "gold";
  poolId: number;
  poolAmount: number;
  eligibleMembers: number;
  sharePerMember: number;
  remainingPool: number;
  members: EligibleMember[];
}

export interface DistributionSummary {
  membersPaid: number;
  totalPaid: number;
  remainingPool: number;
}

/* ============================================================
   Load Eligible Members
============================================================ */

async function getEligibleMembers(
  packageName: "starter" | "smart" | "silver" | "gold",
): Promise<EligibleMember[]> {

  const rows = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.package, packageName),
        eq(usersTable.status, "active"),
        eq(usersTable.ctoActive, true),
        eq(usersTable.ctoLocked, false),
      ),
    );

  return rows.map((u) => ({
    id: u.id,
    memberId: u.memberId,
    name: u.name,
    package: u.package as
      | "starter"
      | "smart"
      | "silver"
      | "gold",
    packageCost: Number(u.packageCost),
    ctoTotalReceived: Number(u.ctoTotalReceived),
  }));
}

/* ============================================================
   Load Monthly Pool
============================================================ */

async function getMonthlyPool(
  month: number,
  year: number,
) {

  const [pool] = await db
    .select()
    .from(ctoMonthlyPoolsTable)
    .where(
      and(
        eq(ctoMonthlyPoolsTable.month, month),
        eq(ctoMonthlyPoolsTable.year, year),
      ),
    );

  if (!pool) {
    throw new Error(
      `CTO pool not found for ${month}/${year}`
    );
  }

  return pool;
}

/* ============================================================
   Calculate Package Distribution
============================================================ */

export async function calculatePackageDistribution(
  month: number,
  year: number,
  packageName: "starter" | "smart" | "silver" | "gold",
): Promise<DistributionResult> {

  const pool = await getMonthlyPool(
    month,
    year,
  );

  let poolAmount = 0;

  switch (packageName) {

    case "starter":
      poolAmount = Number(pool.starterPool);
      break;

    case "smart":
      poolAmount = Number(pool.smartPool);
      break;

    case "silver":
      poolAmount = Number(pool.silverPool);
      break;

    case "gold":
      poolAmount = Number(pool.goldPool);
      break;

  }

  const members =
    await getEligibleMembers(packageName);

  const eligibleMembers =
    members.length;

  const sharePerMember =
    eligibleMembers === 0
      ? 0
      : Number(
          (
            poolAmount /
            eligibleMembers
          ).toFixed(2)
        );

  return {

    package: packageName,

    poolId: pool.id,

    poolAmount,

    eligibleMembers,

    sharePerMember,

    remainingPool: poolAmount,

    members,

  };

}

export async function distributePackagePool(
  month: number,
  year: number,
  packageName: "starter" | "smart" | "silver" | "gold",
): Promise<DistributionSummary> {

  const distribution =
    await calculatePackageDistribution(
      month,
      year,
      packageName,
    );

  let remainingPool =
    distribution.poolAmount;

  let totalPaid = 0;

  let membersPaid = 0;

  for (const member of distribution.members) {

    if (remainingPool <= 0) {
      break;
    }

    const remainingLimit =
      member.packageCost -
      member.ctoTotalReceived;

    if (remainingLimit <= 0) {
      continue;
    }

const payable =
  Math.min(
    distribution.sharePerMember,
    remainingLimit,
    remainingPool,
  );

if (payable <= 0) {
  continue;
}

const newTotalReceived =
  member.ctoTotalReceived + payable;

const reachedLimit =
  newTotalReceived >= member.packageCost;

    await db.transaction(async (tx) => {

      //
      // Load Wallet
      //

      const [wallet] = await tx
        .select()
        .from(walletsTable)
        .where(
          eq(walletsTable.userId, member.id),
        );

      if (!wallet) {
        throw new Error(
          `Wallet not found for user ${member.id}`,
        );
      }

      //
      // Update Wallet
      //

      await tx
        .update(walletsTable)
        .set({

          balance: (
            Number(wallet.balance) +
            payable
          ).toFixed(2),

          totalEarned: (
            Number(wallet.totalEarned) +
            payable
          ).toFixed(2),

          updatedAt: new Date(),

        })
        .where(
          eq(walletsTable.userId, member.id),
        );

      //
      // Create CTO Transaction
      //

      await tx
        .insert(transactionsTable)
        .values({

          userId: member.id,

          type: "cto_royalty",

          amount: payable.toFixed(2),

          description:
            `${packageName.toUpperCase()} CTO Royalty Income`,

          status: "completed",

        });

    //
// Calculate payment state  

//
// Update CTO received & lock if needed
//

await tx
  .update(usersTable)
  .set({

    ctoTotalReceived:
      newTotalReceived.toFixed(2),

    ctoLocked:
      reachedLimit,

  })
  .where(
    eq(usersTable.id, member.id),
  );

//
// Distribution Log
//

await tx
  .insert(ctoDistributionLogsTable)
  .values({

    monthlyPoolId:
      distribution.poolId,

    userId:
      member.id,

    package:
      packageName,

    amount:
      payable.toFixed(2),

    beforeReceived:
      member.ctoTotalReceived.toFixed(2),

    afterReceived:
      newTotalReceived.toFixed(2),

    remainingLimit:
      remainingLimit.toFixed(2),

    shareAmount:
      distribution.sharePerMember.toFixed(2),

    paymentType:
      payable < distribution.sharePerMember
        ? "partial"
        : "full",

    lockedAfterPayment:
      reachedLimit,

  });
});

//
// Load current CTO history
//

const history =
  await getActiveCycle(
    member.id,
  );
//
// Update history
//
if (history) {

  if (reachedLimit) {

    await completeHistory({
      historyId: history.id,
      totalReceived: newTotalReceived,
    });

  } else {

    await updateHistory({
      historyId: history.id,
      totalReceived: newTotalReceived,
    });

  }

} else {

  const newHistory =
    await createHistory({

      userId: member.id,

      package: packageName,

      packageCost: member.packageCost,

    });

  if (reachedLimit) {

    await completeHistory({

      historyId: newHistory.id,

      totalReceived: newTotalReceived,

    });

  } else {

    await updateHistory({

      historyId: newHistory.id,

      totalReceived: newTotalReceived,

    });

  }

}

//
// Keep local object synchronized
//
member.ctoTotalReceived =
  newTotalReceived;

membersPaid++;

totalPaid += payable;

remainingPool -= payable;
  }

  return {
  membersPaid,
  totalPaid: Number(totalPaid.toFixed(2)),
  remainingPool: Number(remainingPool.toFixed(2)),
};

}

async function markPoolCompleted(
  poolId: number,
  treasuryReturned: number,
) {

  await db
    .update(ctoMonthlyPoolsTable)
    .set({

      treasuryReturned:
        treasuryReturned.toFixed(2),

      distributed: true,

      distributedAt: new Date(),

    })
    .where(
      eq(
        ctoMonthlyPoolsTable.id,
        poolId,
      ),
    );

}

function calculateTreasuryReturn(

  starter: DistributionSummary,

  smart: DistributionSummary,

  silver: DistributionSummary,

  gold: DistributionSummary,

): number {

  return Number(

    (
      starter.remainingPool +
      smart.remainingPool +
      silver.remainingPool +
      gold.remainingPool

    ).toFixed(2)

  );

}

export async function distributeMonthlyCTO(

  month: number,

  year: number,

) {

  //
  // Load monthly pool
  //

  const pool =
    await getMonthlyPool(
      month,
      year,
    );

  if (pool.distributed) {

    throw new Error(
      "CTO already distributed for this month."
    );

  }

  //
  // Package-wise distribution
  //

  const starter =
    await distributePackagePool(
      month,
      year,
      "starter",
    );

  const smart =
    await distributePackagePool(
      month,
      year,
      "smart",
    );

  const silver =
    await distributePackagePool(
      month,
      year,
      "silver",
    );

  const gold =
    await distributePackagePool(
      month,
      year,
      "gold",
    );

  //
  // Treasury
  //

  const treasuryReturned =
    calculateTreasuryReturn(

      starter,

      smart,

      silver,

      gold,

    );

  //
  // Close monthly pool
  //

  await markPoolCompleted(

    pool.id,

    treasuryReturned,

  );

  return {

    success: true,

    month,

    year,

    treasuryReturned,

    starter,

    smart,

    silver,

    gold,

  };

}

