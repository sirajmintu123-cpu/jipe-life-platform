export interface Reward {
  rewardId: number;

  memberId: string;

  name: string;

  phone: string;

  tier: number;

  requiredPairs?: number;

  rewardName: string;

  cashValue: string;

  rewardType: string;

  status: "claimed" | "approved" | "delivered";

  achievedAt?: string;

  approvedAt?: string;

  deliveredAt?: string;

  remarks?: string;
}

export interface RewardStats {
  totalClaimed: number;
  totalApproved: number;
  totalDelivered: number;
  totalCashPaid: number;
}