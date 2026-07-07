import { db } from "@workspace/db";
import {
  usersTable,
  rewardLedgerTable,
} from "@workspace/db";

import { eq } from "drizzle-orm";
import { REWARD_MILESTONES } from "../config/rewardMilestones";

export async function processRewardPairs(
  userId: number,
  freshPairs: number
) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) return;


let currentTier = user.rewardLevel ?? 0;
let counter = (user.rewardPairCounter ?? 0) + freshPairs;

while (true) {
  const nextMilestone = REWARD_MILESTONES.find(
    (m) => m.tier === currentTier + 1
  );


  if (!nextMilestone) {
    break;
  }

  if (counter < nextMilestone.pairs) {
    break;
  }


  await db.insert(rewardLedgerTable).values({
      userId,
      tier: nextMilestone.tier,
      requiredPairs: nextMilestone.pairs,
      rewardName: nextMilestone.rewardName,
      cashValue: nextMilestone.cashValue,
      status: "pending",
    });

    counter -= nextMilestone.pairs;
    currentTier = nextMilestone.tier;
  }

  await db.update(usersTable)
    .set({
      rewardLevel: currentTier,
      rewardPairCounter: counter,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId));
}