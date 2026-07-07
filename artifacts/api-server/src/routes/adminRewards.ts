import { Router } from "express";
import { db } from "@workspace/db";

import {
  rewardLedgerTable,
  walletsTable,
  transactionsTable,
} from "@workspace/db";

import { eq, and } from "drizzle-orm";

const router = Router();

/**
 * POST /api/admin/rewards/approve
 *
 * Body:
 * {
 *   "rewardId": 1
 * }
 */
router.post("/approve", async (req, res) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({
        error: "rewardId is required",
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

    if (reward.status !== "claimed") {
      return res.status(400).json({
        error: "Reward must be claimed first",
      });
    }

    // Prevent duplicate wallet credit
    if (reward.rewardType === "cash") {
      const existingTxn = await db
        .select()
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.type, "reward_cash"),
            eq(transactionsTable.referenceId, reward.id)
          )
        );

      if (existingTxn.length > 0) {
        return res.status(400).json({
          error: "Reward already credited",
        });
      }

      const [wallet] = await db
        .select()
        .from(walletsTable)
        .where(eq(walletsTable.userId, reward.userId));

      if (!wallet) {
        return res.status(404).json({
          error: "Wallet not found",
        });
      }

      const rewardAmount = Number(reward.cashValue);

      await db
        .update(walletsTable)
        .set({
          balance: (
            Number(wallet.balance) + rewardAmount
          ).toFixed(2),

          totalEarned: (
            Number(wallet.totalEarned) + rewardAmount
          ).toFixed(2),

          updatedAt: new Date(),
        })
        .where(eq(walletsTable.userId, reward.userId));

      await db.insert(transactionsTable).values({
        userId: reward.userId,
        type: "reward_cash",
        amount: reward.cashValue.toString(),
        description: `${reward.rewardName} Reward Cash`,
        status: "completed",
        referenceId: reward.id,
      });
    }

    await db
      .update(rewardLedgerTable)
      .set({
        status: "approved",
        approvedAt: new Date(),
      })
      .where(eq(rewardLedgerTable.id, reward.id));

    return res.json({
      success: true,
      rewardId: reward.id,
      rewardType: reward.rewardType,
      status: "approved",
    });

  } catch (error) {
    console.error("Reward approval error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/admin/rewards/deliver
 *
 * Body:
 * {
 *   "rewardId": 1
 * }
 */
router.post("/deliver", async (req, res) => {
  try {
    const { rewardId } = req.body;

    const [reward] = await db
      .select()
      .from(rewardLedgerTable)
      .where(eq(rewardLedgerTable.id, rewardId));

    if (!reward) {
      return res.status(404).json({
        error: "Reward not found",
      });
    }

    if (reward.status !== "approved") {
      return res.status(400).json({
        error: "Reward must be approved first",
      });
    }

    await db
      .update(rewardLedgerTable)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
      })
      .where(eq(rewardLedgerTable.id, reward.id));

    return res.json({
      success: true,
      rewardId: reward.id,
      status: "delivered",
    });

  } catch (error) {
    console.error("Reward delivery error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;