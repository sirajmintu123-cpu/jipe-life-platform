import { db } from "@workspace/db";

import {
  usersTable,
  epinsTable,
  ctoHistoryTable,
} from "@workspace/db";

import {
  eq,
  and,
  desc,
} from "drizzle-orm";

import {
  createHistory,
} from "./ctoHistory";

export interface RepurchaseRequest {

  memberId: string;

  epin: string;

}

export interface RepurchaseResult {

  success: boolean;

  userId: number;

  package: string;

  packageCost: number;

  cycleNo: number;

}

async function resetMemberCto(

  userId: number,

  packageName: string,

  packageCost: number,

  bv: number,

) {

  await db
    .update(usersTable)
    .set({

      package: packageName as any,

      packageCost,

      bv: bv.toString(),

      ctoActive: true,

      ctoLocked: false,

      ctoTotalReceived: "0",

      updatedAt: new Date(),

    })
    .where(
      eq(usersTable.id, userId),
    );

}

async function markRepurchasePinUsed(

  epinId: number,

  userId: number,

) {

  await db
    .update(epinsTable)
    .set({

      status: "used",

      usedByUserId: userId,

      usageType: "repurchase",

      usedAt: new Date(),

    })
    .where(
      eq(epinsTable.id, epinId),
    );

}

export async function processRepurchase(
  request: RepurchaseRequest,
): Promise<RepurchaseResult> {

  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.memberId, request.memberId),
        eq(usersTable.status, "active"),
      ),
    );

  if (!user) {
    throw new Error("Member not found.");
  }

  const [epin] = await db
    .select()
    .from(epinsTable)
    .where(
      and(
        eq(epinsTable.pin, request.epin),
        eq(epinsTable.status, "unused"),
      ),
    );

  if (!epin) {
    throw new Error(
      "Invalid or already used E-PIN.",
    );
  }

const history =
  await createHistory({

    userId: user.id,

    package: epin.package,

    packageCost:
      epin.packagePrice,

  });

  await db.transaction(async (tx) => {

    //
    // Reset CTO state
    //

    await tx
      .update(usersTable)
      .set({

        package:
          epin.package as any,

        packageCost:
          epin.packagePrice,

        bv:
          epin.bv.toString(),

        ctoActive: true,

        ctoLocked: false,

        ctoTotalReceived: "0",

        updatedAt: new Date(),

      })
      .where(
        eq(usersTable.id, user.id),
      );

    //
    // Mark E-PIN as repurchase
    //

    await tx
      .update(epinsTable)
      .set({

        status: "used",

        usageType: "repurchase",

        usedByUserId:
          user.id,

        usedAt: new Date(),

      })
      .where(
        eq(epinsTable.id, epin.id),
      );

    //
    // Create new CTO cycle
    //

  });

  return {

  success: true,

  userId: user.id,

  package: epin.package,

  packageCost: epin.packagePrice,

  cycleNo: history.cycleNo,

};
}