import AdminLayout from "@/components/AdminLayout";
import { useAdminListWithdrawals, useAdminApproveWithdrawal, useAdminRejectWithdrawal, getAdminListWithdrawalsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/api";
import { CheckCircle, XCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminWithdrawals() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const approve = useAdminApproveWithdrawal();
  const reject = useAdminRejectWithdrawal();

  const { data, isLoading } = useAdminListWithdrawals(
    { page, status: statusFilter },
    { query: { queryKey: getAdminListWithdrawalsQueryKey({ page, status: statusFilter }) } }
  );

  function handleApprove(id: number) {
    approve.mutate({ withdrawalId: id }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getAdminListWithdrawalsQueryKey({}) });
        toast({ title: "Withdrawal approved and processed" });
      },
      onError: () => toast({ title: "Approval failed", variant: "destructive" }),
    });
  }

  function handleReject() {
    if (!rejectId || !rejectReason.trim()) return;
    reject.mutate({ withdrawalId: rejectId, data: { reason: rejectReason } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getAdminListWithdrawalsQueryKey({}) });
        toast({ title: "Withdrawal rejected" });
        setRejectId(null);
        setRejectReason("");
      },
      onError: () => toast({ title: "Rejection failed", variant: "destructive" }),
    });
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">Withdrawal Management</h1>
          <p className="text-sm text-muted-foreground">Approve or reject member withdrawal requests</p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-3 mb-6">
          {["pending", "approved", "rejected"].map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className={statusFilter === s ? "bg-[#0F2D59]" : ""}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              data-testid={`wd-filter-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Member</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Bank / UPI Details</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Gross</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Deduction (15%)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Net Payable</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  {statusFilter === "pending" && <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={9} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                {!isLoading && (data?.data?.length ?? 0) === 0 && (
                  <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No withdrawal requests</td></tr>
                )}
                {data?.data?.map((w: any) => (
                  <tr key={w.id} className="border-b border-border last:border-0 hover:bg-gray-50" data-testid={`wd-admin-row-${w.id}`}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-bold text-[#0F2D59]">{w.userMemberId ?? `#${w.id}`}</p>
                      <p className="text-xs text-muted-foreground">{w.userName}</p>
                    </td>
                    <td className="px-4 py-3 text-center"><Badge variant="outline" className="text-xs uppercase">{w.method}</Badge></td>
                    <td className="px-4 py-3 text-xs">
                      {w.method === "upi" ? (
                        <span className="font-mono text-[#0F2D59]">{w.upiId ?? "—"}</span>
                      ) : (
                        <div>
                          <p className="font-medium">{w.bankName ?? "—"}</p>
                          <p className="font-mono">{w.bankAccount ?? "—"}</p>
                          <p className="text-muted-foreground">{w.ifscCode ?? "—"}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatINR(w.grossAmount)}</td>
                    <td className="px-4 py-3 text-right text-red-500">— {formatINR(w.deductionAmount)}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600 text-base">{formatINR(w.netAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${STATUS_COLORS[w.status ?? "pending"]}`}>{w.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    {statusFilter === "pending" && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={approve.isPending}
                            onClick={() => handleApprove(w.id)}
                            data-testid={`approve-${w.id}`}
                          >
                            <CheckCircle size={12} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1 text-xs"
                            onClick={() => setRejectId(w.id)}
                            data-testid={`reject-${w.id}`}
                          >
                            <XCircle size={12} /> Reject
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.total > 20 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total}>Next</Button>
              </div>
            </div>
          )}
        </div>

        {/* Rejection Dialog */}
        <Dialog open={!!rejectId} onOpenChange={() => { setRejectId(null); setRejectReason(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Withdrawal #{rejectId}</DialogTitle>
            </DialogHeader>
            <div>
              <label className="text-sm font-medium">Reason for rejection</label>
              <Input
                className="mt-2"
                placeholder="Enter reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                data-testid="input-reject-reason"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={reject.isPending || !rejectReason.trim()} data-testid="button-confirm-reject">
                {reject.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
