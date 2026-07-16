import AdminLayout from "@/components/AdminLayout";
import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { formatINR } from "@/lib/api";
import StatCard from "@/components/StatCard";
import { Users, UserCheck, UserPlus, TrendingUp, Gift, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PKG_COLORS: Record<string, string> = {
  starter: "bg-sky-100 text-sky-800",
  smart: "bg-blue-100 text-blue-800",
  silver: "bg-gray-100 text-gray-700",
  gold: "bg-amber-100 text-amber-800",
};

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminDashboard({ query: { queryKey: getGetAdminDashboardQueryKey() } });

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Members" value={data?.totalMembers ?? 0} icon={Users} accent="blue" />
            <StatCard label="Active Members" value={data?.activeMembers ?? 0} icon={UserCheck} accent="green" />
            <StatCard label="Today's Registrations" value={data?.todayRegistrations ?? 0} icon={UserPlus} accent="gold" />
            <StatCard label="Total Turnover" value={formatINR(data?.totalTurnover ?? 0)} icon={TrendingUp} accent="blue" />
            <StatCard
              label="Lifetime Pairs"
              value={data?.binarySummary?.lifetimePairs ?? 0}
              icon={Layers}
              accent="blue"
            />
            <StatCard
              label="Reward Cash Paid"
              value={formatINR(data?.rewardSummary?.cashPaid ?? 0)}
              icon={Gift}
              accent="green"
            />
            <StatCard
              label="Current CTO Pool"
              value={formatINR(
                (data?.ctoSummary?.starterPool ?? 0) +
                (data?.ctoSummary?.smartPool ?? 0) +
                (data?.ctoSummary?.silverPool ?? 0) +
                (data?.ctoSummary?.goldPool ?? 0)
              )}
              icon={TrendingUp}
              accent="gold"
            />
            <div className="bg-white rounded-xl border border-amber-100 p-5 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Package Breakdown</p>
              <div className="space-y-1.5">
                {[
                  { label: "Starter", count: data?.packageBreakdown?.starter, color: "bg-sky-100 text-sky-800" },
                  { label: "Smart", count: data?.packageBreakdown?.smart, color: "bg-blue-100 text-blue-800" },
                  { label: "Silver", count: data?.packageBreakdown?.silver, color: "bg-gray-100 text-gray-800" },
                  { label: "Gold", count: data?.packageBreakdown?.gold, color: "bg-amber-100 text-amber-800" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <Badge className={`text-xs ${color}`}>{label}</Badge>
                    <span className="text-sm font-bold">{count ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-[#0F2D59]">Recent Registrations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Member ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Package</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={5} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                {!isLoading && (data?.recentRegistrations?.length ?? 0) === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No registrations yet</td></tr>
                )}
                {data?.recentRegistrations?.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-gray-50" data-testid={`recent-user-${u.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-[#0F2D59] font-bold">{u.memberId}</td>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${PKG_COLORS[u.package ?? "smart"]}`}>{u.package?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business Metrics - Reward, Binary, CTO Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Reward Summary */}
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-[#0F2D59]">Reward Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-bold text-amber-600">
                  {data?.rewardSummary?.pending ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-bold text-blue-600">
                  {data?.rewardSummary?.approved ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-bold text-green-600">
                  {data?.rewardSummary?.delivered ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">Cash Paid</span>
                <span className="font-bold text-[#0F2D59]">
                  {formatINR(data?.rewardSummary?.cashPaid ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Binary Summary */}
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-[#0F2D59]">Binary Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Lifetime Pairs</span>
                <span className="font-bold text-[#0F2D59]">
                  {data?.binarySummary?.lifetimePairs ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Today's Pairs</span>
                <span className="font-bold text-emerald-600">
                  {data?.binarySummary?.todayPairs ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">Matching Income</span>
                <span className="font-bold text-[#0F2D59]">
                  {formatINR(data?.binarySummary?.matchingIncome ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* CTO Summary */}
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <h3 className="font-bold text-[#0F2D59]">CTO Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Starter Pool</span>
                <span className="font-bold text-[#0F2D59]">
                  {formatINR(data?.ctoSummary?.starterPool ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Smart Pool</span>
                <span className="font-bold text-[#0F2D59]">
                  {formatINR(data?.ctoSummary?.smartPool ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Silver Pool</span>
                <span className="font-bold text-[#0F2D59]">
                  {formatINR(data?.ctoSummary?.silverPool ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">Gold Pool</span>
                <span className="font-bold text-amber-600">
                  {formatINR(data?.ctoSummary?.goldPool ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}