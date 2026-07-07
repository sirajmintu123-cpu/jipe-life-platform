import MemberLayout from "@/components/MemberLayout";
import {
  useGetWallet, useGetTransactions, useGetMyWithdrawals, useRequestWithdrawal,
  getGetWalletQueryKey, getGetTransactionsQueryKey, getGetMyWithdrawalsQueryKey
} from "@workspace/api-client-react";
import { formatINR } from "@/lib/api";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Wallet as WalletIcon, TrendingUp, ArrowDownLeft, Clock, ArrowRight } from "lucide-react";
import StatCard from "@/components/StatCard";

const DEDUCTION = 0.15;

const withdrawSchema = z.object({
  amount: z.number({ required_error: "Enter amount" }).min(500, "Minimum ₹500"),
  method: z.enum(["bank", "upi"], { required_error: "Select method" }),
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function Wallet() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [txPage, setTxPage] = useState(1);
  const withdraw = useRequestWithdrawal();
  const [previewAmount, setPreviewAmount] = useState(0);

  const { data: wallet, isLoading: walletLoading } = useGetWallet({ query: { queryKey: getGetWalletQueryKey() } });
  const { data: txns, isLoading: txLoading } = useGetTransactions(
    { page: txPage, limit: 15 },
    { query: { queryKey: getGetTransactionsQueryKey({ page: txPage, limit: 15 }) } }
  );
  const { data: withdrawals, isLoading: wdLoading } = useGetMyWithdrawals({ query: { queryKey: getGetMyWithdrawalsQueryKey() } });

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { method: "bank" },
  });

  const gross = previewAmount;
  const deduction = gross * DEDUCTION;
  const net = gross - deduction;

  function onWithdraw(values: z.infer<typeof withdrawSchema>) {
    withdraw.mutate({ data: values }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        qc.invalidateQueries({ queryKey: getGetMyWithdrawalsQueryKey() });
        toast({ title: "Withdrawal request submitted!", description: `Net payable: ${formatINR(net)} after 15% deduction.` });
        form.reset();
        setPreviewAmount(0);
      },
      onError: (err: any) => {
        toast({ title: "Withdrawal failed", description: err?.data?.error, variant: "destructive" });
      },
    });
  }

  return (
    <MemberLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">Wallet</h1>
          <p className="text-sm text-muted-foreground">Balance, transactions and withdrawal requests</p>
        </div>

        {/* Stats */}
        {walletLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Available Balance" value={formatINR(wallet?.balance ?? 0)} icon={WalletIcon} accent="green" />
            <StatCard label="Total Earned" value={formatINR(wallet?.totalEarned ?? 0)} icon={TrendingUp} accent="blue" />
            <StatCard label="Total Withdrawn" value={formatINR(wallet?.totalWithdrawn ?? 0)} icon={ArrowDownLeft} accent="gold" />
            <StatCard label="Pending Withdrawal" value={formatINR(wallet?.pendingWithdrawal ?? 0)} icon={Clock} accent="red" />
          </div>
        )}

        <Tabs defaultValue="transactions">
          <TabsList className="mb-6">
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdraw" data-testid="tab-withdraw">Request Withdrawal</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-withdrawal-history">Withdrawal History</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Description</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txLoading && <tr><td colSpan={5} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                    {!txLoading && (txns?.data?.length ?? 0) === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No transactions yet</td></tr>
                    )}
                    {txns?.data?.map(tx => (
                      <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-gray-50" data-testid={`txn-row-${tx.id}`}>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs capitalize">{tx.type?.replace(/_/g, " ")}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{tx.description}</td>
                        <td className={`px-4 py-3 text-right font-bold ${tx.type === "withdrawal" ? "text-red-600" : "text-emerald-600"}`}>
                          {tx.type === "withdrawal" ? "-" : "+"}{formatINR(Math.abs(tx.amount))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="text-xs bg-emerald-100 text-emerald-800">{tx.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {txns && txns.total > 15 && (
                <div className="p-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Page {txPage} of {Math.ceil(txns.total / 15)}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1}>Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setTxPage(p => p + 1)} disabled={txPage >= Math.ceil(txns.total / 15)}>Next</Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="withdraw">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-bold text-[#0F2D59] mb-4">Request Withdrawal</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onWithdraw)} className="space-y-4">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Amount (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={500}
                            max={wallet?.balance ?? 0}
                            placeholder="Enter amount"
                            data-testid="input-withdraw-amount"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              field.onChange(v);
                              setPreviewAmount(v);
                            }}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Available: {formatINR(wallet?.balance ?? 0)}</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="method" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-method">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button
                      type="submit"
                      className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white"
                      disabled={withdraw.isPending}
                      data-testid="button-withdraw"
                    >
                      {withdraw.isPending ? "Submitting..." : "Submit Withdrawal Request"}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Deduction Preview */}
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-bold text-[#0F2D59] mb-4">Deduction Calculator</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Gross Amount</span>
                    <span className="font-bold">{formatINR(gross)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-red-600">
                    <span className="text-sm">— 10% Administration Fee</span>
                    <span className="font-medium">— {formatINR(gross * 0.10)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-red-600">
                    <span className="text-sm">— 5% TDS (Statutory Tax)</span>
                    <span className="font-medium">— {formatINR(gross * 0.05)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-emerald-50 rounded-lg px-3">
                    <span className="font-bold text-emerald-700 flex items-center gap-1"><ArrowRight size={14} /> Net Payable</span>
                    <span className="font-black text-emerald-700 text-lg">{formatINR(net)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">15% total deduction applies on all withdrawals.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Method</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Gross</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Deduction</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Net</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wdLoading && <tr><td colSpan={6} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                    {!wdLoading && (withdrawals?.length ?? 0) === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No withdrawal requests</td></tr>
                    )}
                    {withdrawals?.map(w => (
                      <tr key={w.id} className="border-b border-border last:border-0" data-testid={`wd-row-${w.id}`}>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-center"><Badge variant="outline" className="text-xs uppercase">{w.method}</Badge></td>
                        <td className="px-4 py-3 text-right">{formatINR(w.grossAmount)}</td>
                        <td className="px-4 py-3 text-right text-red-500">— {formatINR(w.deductionAmount)}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatINR(w.netAmount)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`text-xs ${STATUS_COLORS[w.status] ?? ""}`}>{w.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MemberLayout>
  );
}
