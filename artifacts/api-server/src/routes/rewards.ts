import { Router } from "express";
import { db } from "@workspace/db";
import { rewardLedgerTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { REWARD_MILESTONES } from "../config/rewardMilestones";
import { processRewardPairs } from "../services/rewardService";

const router = Router();



router.get("/rewards", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const rewards = await db
    .select()
    .from(rewardLedgerTable)
    .where(eq(rewardLedgerTable.userId, user.id))
    .orderBy(desc(rewardLedgerTable.id));

  const currentLevel = user.rewardLevel ?? 0;
  const currentCounter = user.rewardPairCounter ?? 0;

  const nextMilestone = REWARD_MILESTONES.find(
    (m) => m.tier === currentLevel + 1
  );

  res.json({
    rewardLevel: currentLevel,
    rewardPairCounter: currentCounter,

    nextMilestone: nextMilestone
      ? {
          tier: nextMilestone.tier,
          pairs: nextMilestone.pairs,
          rewardName: nextMilestone.rewardName,
          cashValue: nextMilestone.cashValue,
          remainingPairs:
            Math.max(
              0,
              nextMilestone.pairs - currentCounter
            ),
        }
      : null,

    rewards,
  });
});


router.get("/reward-dashboard-test", async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.memberId, "ADMIN001"));

  if (!user) {
    return res.json({
      success: false,
      message: "User not found",
    });
  }

  const rewards = await db
    .select()
    .from(rewardLedgerTable)
    .where(eq(rewardLedgerTable.userId, user.id))
    .orderBy(desc(rewardLedgerTable.id));

  res.json({
    rewardLevel: user.rewardLevel,
    rewardPairCounter: user.rewardPairCounter,
    rewards,
  });
});

router.post("/rewards/claim", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const { rewardId, claimAs } = req.body;

  if (!["cash", "product"].includes(claimAs)) {
    return res.status(400).json({
      error: "Invalid claim type",
    });
  }

  const [reward] = await db
    .select()
    .from(rewardLedgerTable)
    .where(eq(rewardLedgerTable.id, rewardId));

  if (!reward) {
    return res.status(404).json({
      error: "Reward not found",
    });
  }

  if (reward.userId !== user.id) {
    return res.status(403).json({
      error: "Unauthorized",
    });
  }

  if (reward.status !== "pending") {
    return res.status(400).json({
      error: "Already claimed",
    });
  }

  await db
    .update(rewardLedgerTable)
    .set({
      rewardType: claimAs,
      status: "claimed",
    })
    .where(eq(rewardLedgerTable.id, rewardId));

  res.json({
    success: true,
    rewardId,
    claimAs,
  });
});

router.get("/reward-claim-test", async (req, res) => {
  await db
    .update(rewardLedgerTable)
    .set({
      rewardType: "cash",
      status: "claimed",
    })
    .where(eq(rewardLedgerTable.id, 1));

  res.json({
    success: true,
  });
});
export default router;