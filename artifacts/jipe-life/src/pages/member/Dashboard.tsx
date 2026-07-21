import MemberLayout from "@/components/MemberLayout";
import StatCard from "@/components/StatCard";
import { useGetUserDashboard, getGetUserDashboardQueryKey } from "@workspace/api-client-react";
import { Wallet, TrendingUp, Users, BarChart3, Star, Zap } from "lucide-react";
import { formatINR } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetBinaryStats,
  getGetBinaryStatsQueryKey
} from "@workspace/api-client-react";

function TransactionRow({ tx }: { tx: any }) {
  const typeColors: Record<string, string> = {
    binary_income: "bg-blue-50 text-blue-700",
    jackpot_bonus: "bg-amber-50 text-amber-700",
    cto_royalty: "bg-emerald-50 text-emerald-700",
    withdrawal: "bg-red-50 text-red-700",
    reward_cash: "bg-purple-50 text-purple-700",
  };
  const typeLabels: Record<string, string> = {
    binary_income: "Binary Income",
    jackpot_bonus: "Jackpot Bonus",
    cto_royalty: "CTO Royalty",
    withdrawal: "Withdrawal",
    reward_cash: "Reward Cash",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0" data-testid={`tx-row-${tx.id}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${typeColors[tx.type] ?? "bg-gray-50 text-gray-700"}`}>
          {typeLabels[tx.type] ?? tx.type}
        </span>
        <span className="text-sm text-muted-foreground truncate">{tx.description}</span>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ml-4 ${tx.type === "withdrawal" ? "text-red-600" : "text-emerald-600"}`}>
        {tx.type === "withdrawal" ? "-" : "+"}{formatINR(Math.abs(tx.amount))}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useGetUserDashboard({
    query: {
      queryKey: getGetUserDashboardQueryKey()
    }
  });

  const { data: stats } = useGetBinaryStats({
    query: {
      queryKey: getGetBinaryStatsQueryKey()
    }
  });

  console.log("Dashboard:", data);
  console.log("Binary Stats:", stats);

  return (
    <MemberLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">Member Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your earnings and network overview</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Available Balance" value={formatINR(data?.availableBalance ?? 0)} icon={Wallet} accent="green" />
            <StatCard label="Today's Earning" value={formatINR(stats?.todayEarning ?? 0)} icon={TrendingUp} accent="blue" />
            <StatCard label="Total Team Size" value={data?.totalTeamSize ?? 0} icon={Users} accent="gold" />
            <StatCard label="Lifetime Pairs" value={data?.totalPairs ?? 0} icon={BarChart3} accent="blue" />
            <StatCard label="Left PV" value={data?.leftBv ?? 0} icon={BarChart3} accent="blue" sub="Binary volume left leg" />
            <StatCard label="Right PV" value={data?.rightBv ?? 0} icon={BarChart3} accent="green" sub="Binary volume right leg" />
            <StatCard label="Today's Pairs" value={stats?.todayPairs ?? 0} icon={Zap} accent="gold" sub="Matched today" />
            <StatCard label="CTO Earned" value={formatINR(data?.ctoEarned ?? 0)} icon={Star} accent={data?.ctoActive ? "green" : "red"} sub={data?.ctoActive ? "Pool active" : "Recovery complete"} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Package Info */}
          <div className="bg-gradient-to-br from-[#0F2D59] to-[#1a3f70] rounded-xl p-6 text-white">
            <p className="text-blue-300 text-xs uppercase tracking-wide mb-2">My Package</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-black">{data?.package?.toUpperCase() ?? "—"}</span>
              <Badge className="bg-amber-400 text-[#0F2D59] text-xs font-bold">Active</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-300">Package Cost</span>
                <span className="font-semibold">{formatINR(data?.packageCost ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">CTO Recovered</span>
                <span className="font-semibold">{formatINR(data?.ctoEarned ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">CTO Status</span>
                <span className={`font-semibold ${data?.ctoActive ? "text-emerald-400" : "text-red-300"}`}>
                  {data?.ctoActive ? "Active" : "Terminated"}
                </span>
              </div>
            </div>
          </div>

          {/* Binary Snapshot */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-sm font-bold text-[#0F2D59] mb-4">Binary Snapshot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Left PV</span>
                <span className="font-bold text-[#0F2D59]">
                  {data?.leftBv ?? 0} PV
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Right PV</span>
                <span className="font-bold text-emerald-600">
                  {data?.rightBv ?? 0} PV
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Today's Pairs</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F2D59]">
                    {stats?.todayPairs ?? 0}
                  </span>
                  {(stats?.todayPairs ?? 0) >= 10 && (
                    <Badge className="bg-amber-400 text-[#0F2D59] text-xs font-bold">
                      JACKPOT
                    </Badge>
                  )}
                  {(stats?.todayPairs ?? 0) >= 4 &&
                   (stats?.todayPairs ?? 0) < 10 && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      CAPPED
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-sm font-bold text-[#0F2D59] mb-4">Recent Transactions</h3>
            {(data?.recentTransactions?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            ) : (
              data?.recentTransactions?.map(tx => <TransactionRow key={tx.id} tx={tx} />)
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}