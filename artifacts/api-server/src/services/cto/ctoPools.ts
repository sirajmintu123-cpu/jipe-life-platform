import { db } from "@workspace/db";
import { ctoMonthlyPoolsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export interface MonthlyPools {

  registrationRevenue: number;

  repurchaseRevenue: number;

  totalRevenue: number;

  starterPool: number;

  smartPool: number;

  silverPool: number;

  goldPool: number;

}

export function calculatePools(

  registrationRevenue: number,

  repurchaseRevenue: number,

): MonthlyPools {

  const totalRevenue =
    registrationRevenue +
    repurchaseRevenue;

  if (totalRevenue <= 0) {

  console.log(
    "[CTO] No revenue this month"
  );

  return {
    registrationRevenue: 0,
    repurchaseRevenue: 0,
    totalRevenue: 0,
    starterPool: 0,
    smartPool: 0,
    silverPool: 0,
    goldPool: 0,
  };

}

  return {

    registrationRevenue,

    repurchaseRevenue,

    totalRevenue,

   starterPool: Number((totalRevenue * 0.04).toFixed(2)),

smartPool: Number((totalRevenue * 0.06).toFixed(2)),

silverPool: Number((totalRevenue * 0.08).toFixed(2)),

goldPool: Number((totalRevenue * 0.12).toFixed(2)),

  };

}
export async function saveMonthlyPools(

  month: number,

  year: number,

  pools: MonthlyPools,

) {

  const [existing] = await db
    .select()
    .from(ctoMonthlyPoolsTable)
    .where(
      and(
        eq(ctoMonthlyPoolsTable.month, month),
        eq(ctoMonthlyPoolsTable.year, year),
      ),
    );

  if (existing) {

    return existing;

  }

  const [created] = await db
    .insert(ctoMonthlyPoolsTable)
    .values({

      month,

      year,

      registrationRevenue:
        pools.registrationRevenue.toFixed(2),

      repurchaseRevenue:
        pools.repurchaseRevenue.toFixed(2),

      totalRevenue:
        pools.totalRevenue.toFixed(2),

      starterPool:
        pools.starterPool.toFixed(2),

      smartPool:
        pools.smartPool.toFixed(2),

      silverPool:
        pools.silverPool.toFixed(2),

      goldPool:
        pools.goldPool.toFixed(2),

      treasuryReturned: "0",

      distributed: false,

    })
    .returning();

  return created;

}