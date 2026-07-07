import { getToken } from "@/lib/api";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getPendingRewards() {
  const res = await fetch(
    "/api/admin/rewards/pending",
    {
      headers: headers(),
    }
  );

  const json = await res.json();

  return json.data ?? [];
}

export async function getApprovedRewards() {
  const res = await fetch(
    "/api/admin/rewards/approved",
    {
      headers: headers(),
    }
  );

  const json = await res.json();

  return json.data ?? [];
}

export async function getDeliveredRewards() {
  const res = await fetch(
    "/api/admin/rewards/delivered",
    {
      headers: headers(),
    }
  );

  const json = await res.json();

  return json.data ?? [];
}

export async function approveReward(
  rewardId: number
) {
  const res = await fetch(
    `/api/admin/rewards/${rewardId}/approve`,
    {
      method: "POST",
      headers: headers(),
    }
  );

  return res.json();
}

export async function deliverReward(
  rewardId: number,
  remarks?: string
) {
  const res = await fetch(
    `/api/admin/rewards/${rewardId}/deliver`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        remarks,
      }),
    }
  );

  return res.json();
}