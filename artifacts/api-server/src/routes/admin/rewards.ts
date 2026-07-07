import { Router } from "express";

import {
  getPendingRewards,
  getApprovedRewards,
  deliverReward,
} from "../../services/rewards/adminRewards";

const router = Router();

router.get("/pending", async (_req, res) => {
  try {
    const rewards = await getPendingRewards();

    return res.json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/approved", async (_req, res) => {
  try {
    const rewards = await getApprovedRewards();

    return res.json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/deliver", async (req, res) => {
  try {
    const { rewardId, remarks } = req.body;

    if (!rewardId) {
      return res.status(400).json({
        success: false,
        message: "rewardId required",
      });
    }

    const result = await deliverReward(
      Number(rewardId),
      remarks
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;