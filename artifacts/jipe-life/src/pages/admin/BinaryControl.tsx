import AdminLayout from "@/components/AdminLayout";
import { useAdminRunBinaryMatching, useGetBinaryHistory } from "@workspace/api-client-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Play, 
  Network, 
  Info, 
  TrendingUp, 
  Users, 
  Wallet, 
  Award, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Gift,
  TrendingDown,
  BarChart3,
  Activity,
  Shield,
  Timer,
  CheckSquare,
  ArrowRight
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  running: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function AdminBinaryControl() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [lastResult, setLastResult] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [processingReport, setProcessingReport] = useState<any>(null);
  const runBinary = useAdminRunBinaryMatching();

  const { data: historyData, isLoading: historyLoading } = useGetBinaryHistory(
    { limit: 10 },
    {}
  );

  // Mock data - replace with actual API calls
const dashboardData = {
  activeMembers: 0,
  todayPairs: 0,
  matchingIncome: 0,
  jackpotBonus: 0,
  netPayout: 0,
};

const engineStatus = {
  status: "Ready",
  statusMessage: "Engine ready",
};

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  function handleRun() {
    setIsConfirmOpen(true);
  }

  function confirmRun() {
    setIsConfirmOpen(false);

    runBinary.mutate(undefined, {
        onSuccess: (res) => {
          setLastResult(res);

          setProcessingReport({
            membersProcessed: res.processedCount || 0,
            pairsGenerated: res.pairsGenerated || 0,
            matchingIncome: res.matchingIncome || 0,
            jackpotMembers: res.jackpotMembers || 0,
            totalWalletCredit: res.totalWalletCredit || 0,
            totalDeduction: res.totalDeduction || 0,
            timeTaken: res.timeTaken || "0 sec",
          });

          qc.invalidateQueries({
            queryKey: ["binary-dashboard"],
          });

          qc.invalidateQueries({
            queryKey: ["binary-engine-status"],
          });

          qc.invalidateQueries({
            queryKey: ["adminBinaryHistory"],
          });

          toast({
            title: "Binary matching complete!",
            description: `${res.processedCount} members processed. ${res.pairsGenerated} pairs generated.`,
          });
        },

        onError: () => {
          toast({
            title: "Binary matching failed",
            variant: "destructive",
          });

          qc.invalidateQueries({
            queryKey: ["binary-engine-status"],
          });
        },
      }
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59] flex items-center gap-2">
            <Network size={22} /> Binary Engine Control
          </h1>
          <p className="text-sm text-muted-foreground">Monitor and control binary pair matching engine</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 size={14} /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock size={14} /> History
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Shield size={14} /> Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Top Row - Binary Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Today's Pairs</p>
                      <p className="text-2xl font-bold text-indigo-600">{dashboardData?.todayPairs ?? 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <TrendingUp size={18} className="text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Matching Income</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatINR(dashboardData?.matchingIncome ?? 0)}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Wallet size={18} className="text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Jackpot Bonus</p>
                      <p className="text-2xl font-bold text-amber-600">{formatINR(dashboardData?.jackpotBonus ?? 0)}</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Award size={18} className="text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Net Payout</p>
                      <p className="text-2xl font-bold text-blue-600">{formatINR(dashboardData?.netPayout ?? 0)}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle size={18} className="text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Binary Health Monitoring */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-purple-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Active Members</p>
                      <p className="text-lg font-bold text-purple-600">{dashboardData?.activeMembers ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Matched Today</p>
                      <p className="text-lg font-bold text-green-600">{dashboardData?.membersWithPairs ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-gray-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">No Pair Generated</p>
                      <p className="text-lg font-bold text-gray-600">{dashboardData?.membersWithoutPairs ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Near Jackpot (8+)</p>
                      <p className="text-lg font-bold text-amber-600">{dashboardData?.membersNearJackpot ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reward & CTO Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50/50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift size={16} className="text-purple-600" />
                    <p className="text-sm font-semibold text-purple-700">Reward Impact</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Members Reaching New Reward Tier Today</span>
                    <Badge className="bg-purple-100 text-purple-800 text-base px-3 py-1">
                      {dashboardData?.rewardAchievements ?? 0} Members
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-r from-cyan-50/50 to-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-cyan-600" />
                    <p className="text-sm font-semibold text-cyan-700">CTO Impact</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Starter</p>
                      <p className="font-bold text-cyan-600 text-sm">{formatINR(dashboardData?.ctoStarter ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Smart</p>
                      <p className="font-bold text-blue-600 text-sm">{formatINR(dashboardData?.ctoSmart ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Silver</p>
                      <p className="font-bold text-gray-600 text-sm">{formatINR(dashboardData?.ctoSilver ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gold</p>
                      <p className="font-bold text-amber-600 text-sm">{formatINR(dashboardData?.ctoGold ?? 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engine Status Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-[#0F2D59]/5 to-[#1a4a7a]/5">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0F2D59]/10 rounded-full flex items-center justify-center">
                      <Activity size={24} className="text-[#0F2D59]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F2D59]">Engine Status</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-xs ${STATUS_COLORS[engineStatus?.status ?? "pending"]}`}>
                          {engineStatus?.statusMessage ?? "Pending"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Last Run:
                          {engineStatus?.lastRunDate ?? "-"} {engineStatus?.lastRunTime ?? "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Next Scheduled:</span>
                      <span className="font-medium">{engineStatus?.nextScheduledRun ?? "-"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Run Button Section */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 flex-1">
                  <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    This engine processes all active members in sequence. For each member, it matches equal left/right PV pairs, calculates payouts, and credits wallets. Run this once per day.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  className="bg-[#0F2D59] hover:bg-[#1a3f70] text-white gap-2 px-8"
                  onClick={handleRun}
                  disabled={runBinary.isPending}
                  data-testid="button-run-binary"
                >
                  <Play size={16} />
                  {runBinary.isPending ? "Running Binary Engine..." : "Run Daily Binary Matching"}
                </Button>
                {runBinary.isPending && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Timer size={16} className="animate-pulse" />
                    <span className="text-sm">Processing... Please wait</span>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Report */}
            {processingReport && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckSquare size={20} className="text-emerald-600" />
                    <h3 className="font-bold text-emerald-700">Binary Processing Report</h3>
                    <Badge className="bg-emerald-200 text-emerald-800 text-xs ml-auto">
                      Completed in {processingReport.timeTaken}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Members Processed</p>
                      <p className="text-xl font-bold text-[#0F2D59]">{processingReport.membersProcessed}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Pairs Generated</p>
                      <p className="text-xl font-bold text-indigo-600">{processingReport.pairsGenerated}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Matching Income</p>
                      <p className="text-xl font-bold text-emerald-600">{formatINR(processingReport.matchingIncome)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Jackpot Members</p>
                      <p className="text-xl font-bold text-amber-600">{processingReport.jackpotMembers}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Wallet Credit</p>
                      <p className="text-xl font-bold text-blue-600">{formatINR(processingReport.totalWalletCredit)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Deduction (15%)</p>
                      <p className="text-xl font-bold text-red-600">{formatINR(processingReport.totalDeduction)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-[#0F2D59] flex items-center gap-2">
                  <Clock size={16} /> Binary Processing History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Members</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pairs</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Matching Income</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Jackpot</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading && <tr><td colSpan={6} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                    {!historyLoading && (!historyData?.data || historyData.data.length === 0) && (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No history available</td></tr>
                    )}
                    {historyData?.data?.map((entry: any) => (
                      <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-center">{entry.members}</td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{entry.pairs}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatINR(entry.matchingIncome)}</td>
                        <td className="px-4 py-3 text-center">{entry.jackpotMembers}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`text-xs ${STATUS_COLORS[entry.status]}`}>
                            {entry.status === "success" ? "✓ Success" : "✗ Failed"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-[#0F2D59] mb-6 flex items-center gap-2">
                <Shield size={18} /> Business Plan Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Matching Ratio", value: "1:1 (Left PV : Right PV)", icon: "⚖️", color: "text-indigo-600" },
                  { label: "Base Payout", value: "₹1,000 per pair", icon: "💰", color: "text-emerald-600" },
                  { label: "Daily Cap", value: "4 pairs = ₹4,000", icon: "📊", color: "text-blue-600" },
                  { label: "Flush Zone", value: "Beyond 4PV (PV carried forward)", icon: "🔄", color: "text-amber-600" },
                  { label: "Jackpot Trigger", value: "Exactly 10 pairs", icon: "🎯", color: "text-purple-600" },
                  { label: "Jackpot Payout", value: "₹7,000 (₹5.2k + ₹1.8k bonus)", icon: "🏆", color: "text-amber-600" },
                  { label: "Beyond 4", value: "₹200/pair (unlimited depth)", icon: "🚀", color: "text-cyan-600" },
                  { label: "Deduction", value: "15% on all payouts", icon: "📉", color: "text-red-600" },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="text-2xl">{rule.icon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{rule.label}</p>
                      <p className={`font-semibold text-sm ${rule.color}`}>{rule.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Run Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#0F2D59] flex items-center gap-2">
              <Play size={18} /> Run Binary Engine?
            </DialogTitle>
            <DialogDescription>
              This will process binary matching for all active members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Members</span>
                <span className="font-bold">{dashboardData?.activeMembers ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated Processing Time</span>
                <span className="font-medium text-amber-600">~30 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expected Pairs</span>
                <span className="font-medium text-indigo-600">~210 pairs</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                This action will credit wallets and update member binary data. This cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#0F2D59] hover:bg-[#1a3f70] text-white gap-2" 
              onClick={confirmRun}
              disabled={runBinary.isPending}
            >
              {runBinary.isPending ? "Processing..." : "Run Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}