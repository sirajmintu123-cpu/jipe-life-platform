import MemberLayout from "@/components/MemberLayout";
import { useGetBinaryStats, useGetBinaryHistory, getGetBinaryStatsQueryKey, getGetBinaryHistoryQueryKey } from "@workspace/api-client-react";
import { formatINR } from "@/lib/api";
import StatCard from "@/components/StatCard";
import { Network, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Binary() {
  const [page, setPage] = useState(1);
  const { data: stats, isLoading: statsLoading } = useGetBinaryStats({ query: { queryKey: getGetBinaryStatsQueryKey() } });
  const { data: history, isLoading: histLoading } = useGetBinaryHistory(
    { page, limit: 15 },
    { query: { queryKey: getGetBinaryHistoryQueryKey({ page, limit: 15 }) } }
  );

  return (
    <MemberLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">Binary Engine</h1>
          <p className="text-sm text-muted-foreground">Daily pair matching results and capping status</p>
        </div>

        {/* Rules Banner */}
        <div className="bg-[#0F2D59] rounded-xl p-5 mb-6 text-white">
          <h3 className="font-bold mb-3 text-amber-400">Matching Rules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-300 text-xs">Base Payout</p>
              <p className="font-bold">₹1,000 / pair</p>
            </div>
            <div>
              <p className="text-blue-300 text-xs">Daily Cap</p>
              <p className="font-bold">4 pairs = ₹4,000</p>
            </div>
            <div>
              <p className="text-blue-300 text-xs">Jackpot (10 pairs)</p>
              <p className="font-bold text-amber-400">₹7,000 total</p>
            </div>
            <div>
              <p className="text-blue-300 text-xs">Beyond 4 pairs</p>
              <p className="font-bold text-emerald-400">₹200 / pair (∞)</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Left PV" value={stats?.leftBv ?? 0} icon={Network} accent="blue" />
            <StatCard label="Right PV" value={stats?.rightBv ?? 0} icon={Network} accent="green" />
            <StatCard label="Today's Pairs" value={stats?.todayPairs ?? 0} icon={Zap} accent={stats?.isJackpot ? "gold" : "blue"} />
            <StatCard label="Today's Earning" value={formatINR(stats?.todayEarning ?? 0)} icon={TrendingUp} accent="green" />
          </div>
        )}

        {/* Status badges */}
        {stats && (
          <div className="flex flex-wrap gap-2 mb-6">
            {stats.isCapped && !stats.isJackpot && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">STANDARD CAP REACHED
(Additional pairs paid at ₹200)</Badge>
            )}
            {stats.isJackpot && (
              <Badge className="bg-amber-400 text-[#0F2D59] font-bold text-sm px-3 py-1">JACKPOT — 10 PAIRS HIT</Badge>
            )}
            {(
  (stats?.carryForwardLeftBv ?? 0) > 0 ||
  (stats?.carryForwardRightBv ?? 0) > 0
) && (
  <>
    <Badge variant="outline">
      Left Carry:
      {stats?.carryForwardLeftBv ?? 0}
    </Badge>

    <Badge variant="outline">
      Right Carry:
      {stats?.carryForwardRightBv ?? 0}
    </Badge>
  </>
)}
            <Badge variant="outline" className="border-[#0F2D59] text-[#0F2D59]">
              Lifetime Pairs: {stats.lifetimePairs}
            </Badge>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-[#0F2D59]">Matching History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pairs</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Flushed</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Gross</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Net Paid</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {histLoading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                ))}
                {!histLoading && (history?.data?.length ?? 0) === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No matching history yet</td></tr>
                )}
                {history?.data?.map(row => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-gray-50" data-testid={`binary-row-${row.id}`}>
                    <td className="px-4 py-3 text-muted-foreground">{row.date}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#0F2D59]">{row.pairsMatched}</td>
                    <td className="px-4 py-3 text-center text-red-500">{row.flushedPairs}</td>
                    <td className="px-4 py-3 text-right">{formatINR(row.grossAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatINR(row.netAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      {row.isJackpot
                        ? <Badge className="bg-amber-400 text-[#0F2D59] text-xs font-bold">JACKPOT</Badge>
                        : <Badge variant="outline" className="text-xs">Normal</Badge>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history && history.total > 15 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(history.total / 15)}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(history.total / 15)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
