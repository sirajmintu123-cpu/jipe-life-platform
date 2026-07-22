import AdminLayout from "@/components/AdminLayout";
import { useAdminRunCtoDistribution, useAdminAddTurnover, useGetCtoPoolStatus, getGetCtoPoolStatusQueryKey, useGetCtoHistory, useGetCtoRecoveryStatus } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatINR } from "@/lib/api";
import { 
  Play, 
  PlusCircle, 
  BarChart3, 
  Users, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Gift,
  Award,
  Lock,
  Unlock,
  Eye,
  User,
  TrendingDown,
  DollarSign
} from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const turnoverSchema = z.object({
  amount: z.number().min(1, "Enter valid amount"),
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2100),
});

const PKG_COLORS: Record<string, string> = {
  starter: "bg-sky-100 text-sky-800 border-sky-200",
  smart: "bg-blue-100 text-blue-800 border-blue-200",
  silver: "bg-gray-100 text-gray-700 border-gray-200",
  gold: "bg-amber-100 text-amber-800 border-amber-200",
};

const PKG_LABELS: Record<string, string> = {
  starter: "Starter",
  smart: "Smart",
  silver: "Silver",
  gold: "Gold",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  terminated: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminCtoControl() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [lastResult, setLastResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const runCto = useAdminRunCtoDistribution();
  const addTurnover = useAdminAddTurnover();

  const now = new Date();
  const { data: poolStatus, isLoading: poolLoading } = useGetCtoPoolStatus({ query: { queryKey: getGetCtoPoolStatusQueryKey() } });
  const { data: historyData, isLoading: historyLoading } = useGetCtoHistory({ limit: 10 }, {});
  const { data: recoveryData, isLoading: recoveryLoading } = useGetCtoRecoveryStatus({ limit: 20 }, {});

  const form = useForm<z.infer<typeof turnoverSchema>>({
    resolver: zodResolver(turnoverSchema),
    defaultValues: {
      amount: 0,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  function onAddTurnover(values: z.infer<typeof turnoverSchema>) {
    addTurnover.mutate({ data: values }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCtoPoolStatusQueryKey() });
        toast({ title: "Turnover recorded successfully!" });
        form.reset({ amount: 0, month: now.getMonth() + 1, year: now.getFullYear() });
      },
      onError: (err: any) => toast({ title: "Failed to record turnover", description: err?.data?.error, variant: "destructive" }),
    });
  }

function handleRunCto() {
  runCto.mutate(
    {
      data: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    },
    {
      onSuccess: (res) => {
        setLastResult(res);
        qc.invalidateQueries({ queryKey: getGetCtoPoolStatusQueryKey() });
        qc.invalidateQueries({ queryKey: ["cto-history"] });
        qc.invalidateQueries({ queryKey: ["cto-recovery"] });
        const processedCount =
  (res.starter?.membersPaid ?? 0) +
  (res.smart?.membersPaid ?? 0) +
  (res.silver?.membersPaid ?? 0) +
  (res.gold?.membersPaid ?? 0);

toast({
  title: "CTO Distribution Complete",
  description: `${processedCount} members received royalties.`,
});
      },
      onError: (err: any) => toast({ title: "CTO distribution failed", description: err?.data?.error, variant: "destructive" }),
    });
  }

  // Check if distribution is already done for the month
  const isDistributionLocked = poolStatus?.distributionStatus === "completed" || poolStatus?.distributionStatus === "locked";
  const distributionDate = poolStatus?.distributionDate;

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59] flex items-center gap-2">
            <TrendingUp size={22} /> CTO Pool Control
          </h1>
          <p className="text-sm text-muted-foreground">Review monthly turnover and distribute CTO royalties</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 size={14} /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock size={14} /> History
            </TabsTrigger>
            <TabsTrigger value="recovery" className="gap-2">
              <Award size={14} /> Recovery Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Pool Status - All 4 Pools including Starter */}
            {poolLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : poolStatus && (
              <>
                <div className="bg-gradient-to-br from-[#0F2D59] to-[#1a3f70] rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-blue-300 text-xs uppercase tracking-wider">
                      {MONTHS[(poolStatus.month ?? 1) - 1]} {poolStatus.year} — CTO Pool Summary
                    </p>
                    {isDistributionLocked ? (
                      <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 border">
                        <Lock size={12} className="mr-1" /> Distributed on {distributionDate}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 border">
                        <Unlock size={12} className="mr-1" /> Pending Distribution
                      </Badge>
                    )}
                  </div>
                  
                  {/* Revenue Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-blue-300 text-xs">Registration Revenue</p>
                      <p className="text-xl font-bold">{formatINR(poolStatus.registrationRevenue || 0)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-blue-300 text-xs">Repurchase Revenue</p>
                      <p className="text-xl font-bold">{formatINR(poolStatus.repurchaseRevenue || 0)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                      <p className="text-blue-300 text-xs">Total Revenue</p>
                      <p className="text-2xl font-black text-white">{formatINR(poolStatus.totalTurnover || 0)}</p>
                    </div>
                  </div>

                  {/* 4 Pool Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-sky-500/10 rounded-lg p-4 border border-sky-400/20">
                      <p className="text-sky-300 text-xs uppercase tracking-wider">Starter Pool (4%)</p>
                      <p className="text-2xl font-bold text-sky-200">{formatINR(poolStatus.starterPool || 0)}</p>
                      <p className="text-xs text-sky-300/70 mt-1">
                        {poolStatus.starterActiveUsers || 0} members · {formatINR(poolStatus.starterPerShare || 0)}/each
                      </p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                      <p className="text-blue-300 text-xs uppercase tracking-wider">Smart Pool (6%)</p>
                      <p className="text-2xl font-bold text-blue-200">{formatINR(poolStatus.smartPool || 0)}</p>
                      <p className="text-xs text-blue-300/70 mt-1">
                        {poolStatus.smartActiveUsers || 0} members · {formatINR(poolStatus.smartPerShare || 0)}/each
                      </p>
                    </div>
                    <div className="bg-gray-500/10 rounded-lg p-4 border border-gray-400/20">
                      <p className="text-gray-300 text-xs uppercase tracking-wider">Silver Pool (8%)</p>
                      <p className="text-2xl font-bold text-gray-200">{formatINR(poolStatus.silverPool || 0)}</p>
                      <p className="text-xs text-gray-300/70 mt-1">
                        {poolStatus.silverActiveUsers || 0} members · {formatINR(poolStatus.silverPerShare || 0)}/each
                      </p>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-400/20">
                      <p className="text-amber-300 text-xs uppercase tracking-wider">Gold Pool (12%)</p>
                      <p className="text-2xl font-bold text-amber-200">{formatINR(poolStatus.goldPool || 0)}</p>
                      <p className="text-xs text-amber-300/70 mt-1">
                        {poolStatus.goldActiveUsers || 0} members · {formatINR(poolStatus.goldPerShare || 0)}/each
                      </p>
                    </div>
                  </div>

                  {/* Total CTO */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300 text-sm">Total CTO Pool (30%)</span>
                      <span className="text-2xl font-bold text-white">
                        {formatINR(
                          (poolStatus.starterPool || 0) + 
                          (poolStatus.smartPool || 0) + 
                          (poolStatus.silverPool || 0) + 
                          (poolStatus.goldPool || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distribution Preview */}
                {!isDistributionLocked && poolStatus && (
                  <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye size={16} className="text-amber-600" />
                        <h4 className="font-semibold text-amber-800">Distribution Preview</h4>
                        <Badge className="bg-amber-200 text-amber-800 text-xs ml-auto">
                          {poolStatus.totalActiveMembers || 0} Active Members
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/60 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Starter Pool</p>
                          <p className="font-bold text-sky-600">{formatINR(poolStatus.starterPool || 0)}</p>
                          <p className="text-xs text-muted-foreground">{poolStatus.starterActiveUsers || 0} members · {formatINR(poolStatus.starterPerShare || 0)} each</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Smart Pool</p>
                          <p className="font-bold text-blue-600">{formatINR(poolStatus.smartPool || 0)}</p>
                          <p className="text-xs text-muted-foreground">{poolStatus.smartActiveUsers || 0} members · {formatINR(poolStatus.smartPerShare || 0)} each</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Silver Pool</p>
                          <p className="font-bold text-gray-600">{formatINR(poolStatus.silverPool || 0)}</p>
                          <p className="text-xs text-muted-foreground">{poolStatus.silverActiveUsers || 0} members · {formatINR(poolStatus.silverPerShare || 0)} each</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Gold Pool</p>
                          <p className="font-bold text-amber-600">{formatINR(poolStatus.goldPool || 0)}</p>
                          <p className="text-xs text-muted-foreground">{poolStatus.goldActiveUsers || 0} members · {formatINR(poolStatus.goldPerShare || 0)} each</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Distribution Lock Warning */}
                {isDistributionLocked && (
                  <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={20} className="text-emerald-600" />
                        <div>
                          <p className="font-semibold text-emerald-700">CTO Already Distributed</p>
                          <p className="text-sm text-emerald-600">
                            {MONTHS[(poolStatus.month ?? 1) - 1]} {poolStatus.year} distribution completed on {distributionDate}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Control Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Turnover */}
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-bold text-[#0F2D59] mb-4 flex items-center gap-2">
                  <PlusCircle size={16} /> Record Monthly Turnover
                </h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddTurnover)} className="space-y-4">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Turnover Amount (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g. 500000"
                            data-testid="input-turnover-amount"
                            value={field.value || ""}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="month" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <FormControl>
                            <select
                              className="w-full border border-input rounded-md px-3 py-2 text-sm"
                              value={field.value}
                              onChange={e => field.onChange(parseInt(e.target.value, 10))}
                              data-testid="select-month"
                            >
                              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="year" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input type="number" min={2024} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} data-testid="input-year" />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white" disabled={addTurnover.isPending} data-testid="button-add-turnover">
                      {addTurnover.isPending ? "Recording..." : "Record Turnover"}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Run Distribution */}
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-bold text-[#0F2D59] mb-4 flex items-center gap-2">
                  <Play size={16} /> Run CTO Distribution
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Distributes this month's pool amounts to all active members based on their package. Each member receives their equal share. Once 100% of their package cost is recovered, their CTO is terminated.
                </p>
                
                {isDistributionLocked ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Lock size={16} />
                      <span className="text-sm font-medium">Distribution Locked</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      CTO for {MONTHS[(poolStatus?.month ?? 1) - 1]} {poolStatus?.year} has already been distributed.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Unlock size={16} />
                      <span className="text-sm font-medium">Ready to Distribute</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      {poolStatus?.totalActiveMembers || 0} active members will receive their shares.
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={handleRunCto}
                  disabled={runCto.isPending || isDistributionLocked}
                  data-testid="button-run-cto"
                >
                  <BarChart3 size={16} />
                  {runCto.isPending ? "Distributing..." : isDistributionLocked ? "Already Distributed" : "Run Monthly CTO Distribution"}
                </Button>

                {lastResult && (
  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
    <p className="font-bold text-emerald-700">
      Distribution Complete
    </p>

    <p className="text-sm text-emerald-600 mt-1">
      CTO distribution completed successfully.
    </p>

    <p className="text-xs text-emerald-500 mt-2">
      Total Members Processed:{" "}
      {(lastResult.starter?.membersPaid ?? 0) +
        (lastResult.smart?.membersPaid ?? 0) +
        (lastResult.silver?.membersPaid ?? 0) +
        (lastResult.gold?.membersPaid ?? 0)}
    </p>

    <div className="mt-3 text-xs text-gray-700 space-y-1">
      <p>Starter : {lastResult.starter?.membersPaid ?? 0}</p>
      <p>Smart : {lastResult.smart?.membersPaid ?? 0}</p>
      <p>Silver : {lastResult.silver?.membersPaid ?? 0}</p>
      <p>Gold : {lastResult.gold?.membersPaid ?? 0}</p>
    </div>

    <p className="mt-3 text-xs text-emerald-700 font-semibold">
      Treasury Returned: {formatINR(lastResult.treasuryReturned ?? 0)}
    </p>
  </div>
)}
              </div>
            </div>

            {/* Top CTO Earners Widget */}
            {poolStatus?.topEarners && poolStatus.topEarners.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-bold text-[#0F2D59] mb-3 flex items-center gap-2">
                    <Award size={16} /> Top CTO Earners
                  </h4>
                  <div className="space-y-2">
                    {poolStatus.topEarners.slice(0, 5).map((earner: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-6">#{idx + 1}</span>
                          <span className="font-mono text-xs font-bold text-[#0F2D59]">{earner.memberId}</span>
                          <span className="text-xs text-muted-foreground">{earner.name}</span>
                        </div>
                        <span className="font-bold text-emerald-600 text-sm">{formatINR(earner.totalCto)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CTO History Tab */}
          <TabsContent value="history">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-[#0F2D59] flex items-center gap-2">
                  <Calendar size={16} /> CTO Distribution History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Month</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Turnover</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pool Amount</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Members Paid</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Distribution Date</th>
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
                          {MONTHS[(entry.month || 1) - 1]} {entry.year}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatINR(entry.turnover)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatINR(entry.poolAmount)}</td>
                        <td className="px-4 py-3 text-center">{entry.membersPaid}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(entry.distributionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`text-xs ${entry.status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
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

          {/* Recovery Status Tab */}
          <TabsContent value="recovery">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-[#0F2D59] flex items-center gap-2">
                  <Award size={16} /> Package Recovery Status
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Members who have recovered 100% of their package cost are terminated from CTO</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Member ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Package</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Received CTO</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Maximum CTO</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Remaining</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recoveryLoading && <tr><td colSpan={7} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                    {!recoveryLoading && (!recoveryData?.data || recoveryData.data.length === 0) && (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No recovery data available</td></tr>
                    )}
                    {recoveryData?.data?.map((member: any) => {
                      const remaining = (member.maxCto || 0) - (member.receivedCto || 0);
                      const isCompleted = remaining <= 0;
                      return (
                        <tr key={member.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-[#0F2D59]">{member.memberId}</td>
                          <td className="px-4 py-3 font-medium">{member.name}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={`text-xs ${PKG_COLORS[member.package]}`}>
                              {PKG_LABELS[member.package]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatINR(member.receivedCto || 0)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatINR(member.maxCto || 0)}</td>
                          <td className="px-4 py-3 text-right font-bold">
                            {isCompleted ? (
                              <span className="text-emerald-600">✓ Completed</span>
                            ) : (
                              <span className="text-amber-600">{formatINR(remaining)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={`text-xs ${STATUS_COLORS[isCompleted ? "completed" : "active"]}`}>
                              {isCompleted ? "Recovered" : "Active"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}