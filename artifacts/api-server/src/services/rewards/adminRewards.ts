import { db } from "@workspace/db";
import {
  rewardLedgerTable,
  usersTable,
} from "@workspace/db";

import { eq, desc } from "drizzle-orm";

export async function getPendingRewards() {
  return db
    .select({
      rewardId: rewardLedgerTable.id,
      userId: rewardLedgerTable.userId,
      tier: rewardLedgerTable.tier,
      rewardName: rewardLedgerTable.rewardName,
      cashValue: rewardLedgerTable.cashValue,
      rewardType: rewardLedgerTable.rewardType,
      achievedAt: rewardLedgerTable.achievedAt,
      status: rewardLedgerTable.status,

      memberId: usersTable.memberId,
name: usersTable.name,
phone: usersTable.phone,
    })
    .from(rewardLedgerTable)
    .leftJoin(
      usersTable,
      eq(usersTable.id, rewardLedgerTable.userId)
    )
    .where(eq(rewardLedgerTable.status, "claimed"))
    .orderBy(desc(rewardLedgerTable.achievedAt));
}
export async function getApprovedRewards() {
  return db
    .select({
      rewardId: rewardLedgerTable.id,
      userId: rewardLedgerTable.userId,
      tier: rewardLedgerTable.tier,
      rewardName: rewardLedgerTable.rewardName,
      cashValue: rewardLedgerTable.cashValue,
      rewardType: rewardLedgerTable.rewardType,
      approvedAt: rewardLedgerTable.approvedAt,
      status: rewardLedgerTable.status,

      memberId: usersTable.memberId,
name: usersTable.name,
phone: usersTable.phone,
    })
    .from(rewardLedgerTable)
    .leftJoin(
      usersTable,
      eq(usersTable.id, rewardLedgerTable.userId)
    )
    .where(eq(rewardLedgerTable.status, "approved"))
    .orderBy(desc(rewardLedgerTable.approvedAt));
}

export async function approveReward(
  rewardId: number
) {
  const [reward] = await db
    .select()
    .from(rewardLedgerTable)
    .where(eq(rewardLedgerTable.id, rewardId))
    .limit(1);

  if (!reward) {
    throw new Error("Reward not found");
  }

  if (reward.status !== "claimed") {
    throw new Error(
      "Only claimed rewards can be approved"
    );
  }

  await db
    .update(rewardLedgerTable)
    .set({
      status: "approved",
      approvedAt: new Date(),
    })
    .where(eq(rewardLedgerTable.id, rewardId));

  return {
    success: true,
    message: "Reward approved successfully",
  };
}

export async function getDeliveredRewards() {
  return db
    .select({
      rewardId: rewardLedgerTable.id,
      userId: rewardLedgerTable.userId,
      tier: rewardLedgerTable.tier,
      rewardName: rewardLedgerTable.rewardName,
      cashValue: rewardLedgerTable.cashValue,
      rewardType: rewardLedgerTable.rewardType,
      deliveredAt: rewardLedgerTable.deliveredAt,
      status: rewardLedgerTable.status,

      memberId: usersTable.memberId,
      name: usersTable.name,
      phone: usersTable.phone,
    })
    .from(rewardLedgerTable)
    .leftJoin(
      usersTable,
      eq(usersTable.id, rewardLedgerTable.userId)
    )
    .where(eq(rewardLedgerTable.status, "delivered"))
    .orderBy(desc(rewardLedgerTable.deliveredAt));
}

export async function deliverReward(
  rewardId: number,
  remarks?: string
) {
const [reward] = await db
  .select()
  .from(rewardLedgerTable)
  .where(eq(rewardLedgerTable.id, rewardId))
  .limit(1);

  if (!reward) {
    throw new Error("Reward not found");
  }

  if (reward.status !== "approved") {
    throw new Error(
      "Only approved rewards can be delivered"
    );
  }

  await db
    .update(rewardLedgerTable)
    .set({
      status: "delivered",
      deliveredAt: new Date(),
      remarks: remarks ?? reward.remarks,
    })
    .where(eq(rewardLedgerTable.id, rewardId));

  return {
    success: true,
    message: "Reward delivered successfully",
  };
}
