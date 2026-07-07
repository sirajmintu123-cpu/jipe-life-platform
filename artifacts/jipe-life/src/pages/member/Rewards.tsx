import MemberLayout from "@/components/MemberLayout";
import { useGetRewards, useClaimReward, getGetRewardsQueryKey } from "@workspace/api-client-react";
import { formatINR } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Gift, BadgeDollarSign, CheckCircle, Lock, Trophy } from "lucide-react";

const MILESTONES = [
  { index: 0, pairs: 25, rewardName: "T-Shirt", cashValue: 500 },
  { index: 1, pairs: 50, rewardName: "Leather Bag", cashValue: 2000 },
  { index: 2, pairs: 100, rewardName: "Trolley Bag", cashValue: 5000 },
  { index: 3, pairs: 200, rewardName: "Cooling Freeze", cashValue: 15000 },
  { index: 4, pairs: 500, rewardName: "Inverter Set", cashValue: 30000 },
  { index: 5, pairs: 1000, rewardName: "Bike", cashValue: 80000 },
  { index: 6, pairs: 10000, rewardName: "Jawa Bike", cashValue: 250000 },
  { index: 7, pairs: 30000, rewardName: "Tata Punch Car", cashValue: 550000 },
  { index: 8, pairs: 50000, rewardName: "Tata Sierra Car", cashValue: 1150000 },
];

export default function Rewards() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useGetRewards({ query: { queryKey: getGetRewardsQueryKey() } });
  const claim = useClaimReward();

  function handleClaim(milestoneId: number, claimAs: "reward" | "cash") {
    claim.mutate({ data: { milestoneId, claimAs } }, {
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: getGetRewardsQueryKey() });
        toast({
          title: "Reward Claimed!",
          description: claimAs === "cash"
            ? `${formatINR(res.cashValue)} credited to your wallet.`
            : `${res.rewardName} will be dispatched to you.`,
        });
      },
      onError: () => toast({ title: "Claim failed", variant: "destructive" }),
    });
  }

  const lifetimePairs = data?.lifetimePairs ?? 0;

  return (
    <MemberLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">Lifetime Rewards</h1>
          <p className="text-sm text-muted-foreground">Cumulative pair milestones — no resets, no deadlines</p>
        </div>

        {/* Progress Header */}
        <div className="bg-gradient-to-br from-[#0F2D59] to-[#1a3f70] rounded-xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy size={24} className="text-amber-400" />
            <div>
              <p className="text-2xl font-black">{lifetimePairs.toLocaleString("en-IN")} Pairs</p>
              <p className="text-blue-300 text-sm">Lifetime total</p>
            </div>
          </div>
          {data?.nextMilestone && (
            <>
              <p className="text-blue-300 text-xs mb-2">Next: {data.nextMilestoneName} at {data.nextMilestone.toLocaleString("en-IN")} pairs</p>
              <Progress
                value={Math.min(100, (lifetimePairs / data.nextMilestone) * 100)}
                className="h-2 bg-white/20"
              />
              <p className="text-xs text-blue-300 mt-1">
                {Math.max(0, data.nextMilestone - lifetimePairs).toLocaleString("en-IN")} pairs to go
              </p>
            </>
          )}
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
            : MILESTONES.map((m, idx) => {
                const milestoneData = data?.milestones?.find(ms => ms.pairs === m.pairs);
                const reached = lifetimePairs >= m.pairs;
                const claimed = milestoneData?.claimed;
                const claimedAs = milestoneData?.claimedAs;

                return (
                  <div
                    key={m.pairs}
                    data-testid={`milestone-${m.pairs}`}
                    className={`bg-white rounded-xl border p-5 transition-all ${
                      claimed ? "border-emerald-200 bg-emerald-50/30"
                      : reached ? "border-amber-300 shadow-md"
                      : "border-border opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{m.pairs.toLocaleString("en-IN")} Pairs</p>
                        <p className="font-black text-[#0F2D59] text-base mt-0.5">{m.rewardName}</p>
                        <p className="text-emerald-600 font-bold text-sm">OR {formatINR(m.cashValue)}</p>
                      </div>
                      {claimed
                        ? <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                        : reached
                        ? <Badge className="bg-amber-400 text-[#0F2D59] text-xs font-bold flex-shrink-0">Ready</Badge>
                        : <Lock size={16} className="text-muted-foreground flex-shrink-0" />
                      }
                    </div>

                    {claimed ? (
                      <p className="text-xs text-emerald-600 font-medium">
                        Claimed as: {claimedAs === "cash" ? `Cash (${formatINR(m.cashValue)})` : m.rewardName}
                      </p>
                    ) : reached ? (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs gap-1 border-[#0F2D59] text-[#0F2D59] hover:bg-[#0F2D59] hover:text-white"
                          disabled={claim.isPending}
                          onClick={() => handleClaim(idx, "reward")}
                          data-testid={`claim-reward-${m.pairs}`}
                        >
                          <Gift size={12} /> {m.rewardName}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={claim.isPending}
                          onClick={() => handleClaim(idx, "cash")}
                          data-testid={`claim-cash-${m.pairs}`}
                        >
                          <BadgeDollarSign size={12} /> {formatINR(m.cashValue)}
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Progress value={Math.min(100, (lifetimePairs / m.pairs) * 100)} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1">{Math.max(0, m.pairs - lifetimePairs).toLocaleString("en-IN")} more pairs needed</p>
                      </div>
                    )}
                  </div>
                );
              })
          }
        </div>
      </div>
    </MemberLayout>
  );
}
