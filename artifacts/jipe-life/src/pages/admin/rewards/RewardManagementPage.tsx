import { useEffect, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import RewardStatsCards from "./RewardStatsCards";
import PendingRewardsTable from "./PendingRewardsTable";
import ApprovedRewardsTable from "./ApprovedRewardsTable";
import DeliveredRewardsTable from "./DeliveredRewardsTable";

import {
  getPendingRewards,
  getApprovedRewards,
  getDeliveredRewards,
} from "@/services/adminRewards";
import AdminLayout from "@/components/AdminLayout";

export default function RewardManagementPage() {
  const [pendingRewards, setPendingRewards] = useState([]);
  const [approvedRewards, setApprovedRewards] = useState([]);
  const [deliveredRewards, setDeliveredRewards] = useState([]);

  const [loading, setLoading] = useState(true);

  async function loadRewards() {    try {
      setLoading(true);

      const [
        pending,
        approved,
        delivered,
      ] = await Promise.all([
        getPendingRewards(),
        getApprovedRewards(),
        getDeliveredRewards(),
      ]);

      setPendingRewards(pending);
      setApprovedRewards(approved);
      setDeliveredRewards(delivered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

return (
  <AdminLayout>
    <div className="space-y-6 p-6">
      <RewardStatsCards
        pendingCount={pendingRewards.length}
        approvedCount={approvedRewards.length}
        deliveredCount={deliveredRewards.length}
        totalCashPaid={
          deliveredRewards.reduce(
            (sum: number, reward: any) =>
              sum + Number(reward.cashValue || 0),
            0
          )
        }
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Rewards
          </TabsTrigger>

          <TabsTrigger value="approved">
            Approved Rewards
          </TabsTrigger>

          <TabsTrigger value="delivered">
            Delivered Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingRewardsTable
            rewards={pendingRewards}
            loading={loading}
            refreshData={loadRewards}
          />
        </TabsContent>

        <TabsContent value="approved">
          <ApprovedRewardsTable
            rewards={approvedRewards}
            loading={loading}
            refreshData={loadRewards}
          />
        </TabsContent>

        <TabsContent value="delivered">
          <DeliveredRewardsTable
            rewards={deliveredRewards}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  </AdminLayout>
  );
}