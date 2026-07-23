import MemberLayout from "@/components/MemberLayout";
import {
  useGetCtoPoolStatus, useGetCtoMemberSummary, getGetCtoMemberSummaryQueryKey, useGetCtoHistory, useGetCtoRecoveryStatus,
  getGetCtoPoolStatusQueryKey, getGetCtoHistoryQueryKey, getGetCtoRecoveryStatusQueryKey
} from "@workspace/api-client-react";
import { formatINR } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Cto() {
  const { data: pool, isLoading: poolLoading } = useGetCtoPoolStatus({ query: { queryKey: getGetCtoPoolStatusQueryKey() } });
  const { data: history, isLoading: histLoading } = useGetCtoHistory({ query: { queryKey: getGetCtoHistoryQueryKey() } });
  const { data: recovery, isLoading: recLoading } = useGetCtoRecoveryStatus({ query: { queryKey: getGetCtoRecoveryStatusQueryKey() } });
const {
  data: summary,
  isLoading: summaryLoading,
} = useGetCtoMemberSummary({
  query: {
    queryKey: getGetCtoMemberSummaryQueryKey(),
  },
});
  return (
    <MemberLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">CTO Royalty Pool</h1>
          <p className="text-sm text-muted-foreground">30% of global monthly turnover — divided equally among active members</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

  <div className="bg-white rounded-xl border p-5">
    <p className="text-xs text-muted-foreground">
      Total CTO Earned
    </p>
    <p className="text-2xl font-black text-emerald-600">
      {formatINR(summary?.totalEarned ?? 0)}
    </p>
  </div>

  <div className="bg-white rounded-xl border p-5">
    <p className="text-xs text-muted-foreground">
      Current Month
    </p>
    <p className="text-2xl font-black text-blue-600">
      {formatINR(summary?.currentMonthIncome ?? 0)}
    </p>
  </div>

         <div className="bg-white rounded-xl border p-5">
  <p className="text-xs text-muted-foreground">
    Recovery Remaining
  </p>

  <p className="text-2xl font-black text-orange-600">
    {formatINR(summary?.remainingRecovery ?? 0)}
  </p>

  <p className="text-xs text-muted-foreground mt-1">
    Until 100% package recovery
  </p>
</div>

  <div className="bg-white rounded-xl border p-5">
    <p className="text-xs text-muted-foreground">
  Package
</p>

<p className="text-xl font-bold">
  {summary?.package?.toUpperCase()}
</p>

<p className="text-xs text-muted-foreground mt-1">
  Target: {formatINR(summary?.packageCost ?? 0)}
</p>
  </div>

  <div className="bg-white rounded-xl border p-5">
    <p className="text-xs text-muted-foreground">
      CTO Status
    </p>

    {summary?.ctoActive ? (
    <Badge className="bg-green-100 text-green-700 border border-green-300">
  Active
</Badge>

    ) : (
      <Badge className="bg-red-100 text-red-700 border border-red-300">
  Completed
</Badge>
    )}

  </div>

</div>

        {/* Recovery Status */}
        <div className="bg-gradient-to-br from-[#0F2D59] to-[#1a3f70] rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-300 text-xs uppercase tracking-wide">Package Recovery Status</p>
              <p className="text-2xl font-black mt-1">{formatINR(recovery?.totalReceived ?? 0)}</p>
              <p className="text-blue-300 text-sm">of {formatINR(recovery?.packageCost ?? 0)} target</p>
            </div>
            {recLoading ? <Skeleton className="w-24 h-8 bg-white/10" /> : (
              recovery?.ctoActive
                ? <Badge className="bg-emerald-400 text-emerald-900 font-bold">CTO Active</Badge>
                : <Badge className="bg-red-400 text-white font-bold">Terminated</Badge>
            )}
          </div>
          <Progress value={recovery?.recoveryPercent ?? 0} className="h-2 bg-white/20" />
          <div className="flex justify-between text-xs mt-2 text-blue-300">
            <span>{(recovery?.recoveryPercent ?? 0).toFixed(1)}% recovered</span>
            <span>{formatINR(recovery?.remainingForRecovery ?? 0)} remaining</span>
          </div>
          {!recovery?.ctoActive && (
            <div className="mt-3 flex items-center gap-2 text-amber-300 text-sm">
              <XCircle size={14} />
              <span>100% recovery reached. CTO payouts terminated. Repurchase required to reactivate.</span>
            </div>
          )}
        </div>

         

        {/* Pool Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
  {
    label: "Starter Pool (4%)",
    key: "starterPool",
    share: pool?.starterPerShare,
    users: pool?.starterActiveUsers,
    accent: "border-sky-200 bg-sky-50",
  },
  {
    label: "Smart Pool (6%)",
    key: "smartPool",
    share: pool?.smartPerShare,
    users: pool?.smartActiveUsers,
    accent: "border-blue-200 bg-blue-50",
  },
  {
    label: "Silver Pool (8%)",
    key: "silverPool",
    share: pool?.silverPerShare,
    users: pool?.silverActiveUsers,
    accent: "border-gray-200 bg-gray-50",
  },
  {
    label: "Gold Pool (12%)",
    key: "goldPool",
    share: pool?.goldPerShare,
    users: pool?.goldActiveUsers,
    accent: "border-amber-200 bg-amber-50",
  },
].map(({ label, key, share, users, accent }) => (
            <div key={key} className={`border rounded-xl p-5 ${accent}`}>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{label}</p>
              {poolLoading ? <Skeleton className="h-8 w-24 mb-2" /> : (
                <p className="text-xl font-black text-[#0F2D59]">{formatINR((pool as any)?.[key] ?? 0)}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatINR(share ?? 0)} / member · {users ?? 0} active
              </p>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div className="bg-white rounded-xl border border-border p-5 mb-6">
          <h3 className="font-bold text-[#0F2D59] mb-3">How CTO Royalty Works</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 30% of total global monthly turnover is allocated to the CTO pool.</p>
          <p>• <strong>Starter Package:</strong> 4% of turnover ÷ total Starter active members</p>
<p>• <strong>Smart Package:</strong> 6% of turnover ÷ total Smart active members</p>
<p>• <strong>Silver Package:</strong> 8% of turnover ÷ total Silver active members</p>
<p>• <strong>Gold Package:</strong> 12% of turnover ÷ total Gold active members</p>
            <p>• Payouts continue until you recover 100% of your initial package cost.</p>
            <p>• Once 100% is recovered, CTO payouts terminate until a repurchase is done.</p>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-[#0F2D59]">Payout History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Month</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Package</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Cumulative</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {histLoading && <tr><td colSpan={5} className="px-4 py-8 text-center"><Skeleton className="h-4 w-full" /></td></tr>}
                {!histLoading && (history?.length ?? 0) === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No CTO payouts yet</td></tr>
                )}
                {history?.map(d => (
                  <tr key={d.id} className="border-b border-border last:border-0" data-testid={`cto-row-${d.id}`}>
                    <td className="px-4 py-3">{MONTHS[(d.month ?? 1) - 1]} {d.year}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="text-xs">{d.package?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatINR(d.amount)}</td>
                    <td className="px-4 py-3 text-right">{formatINR(d.cumulativeReceived)}</td>
                    <td className="px-4 py-3 text-center">
                      {d.isTerminated
                        ? <span className="flex items-center justify-center gap-1 text-xs text-red-500"><XCircle size={12} />Terminated</span>
                        : <span className="flex items-center justify-center gap-1 text-xs text-emerald-600"><CheckCircle size={12} />Active</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
