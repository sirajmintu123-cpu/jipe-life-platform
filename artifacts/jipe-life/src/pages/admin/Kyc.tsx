import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/api";
import { ShieldCheck, Eye, CheckCircle, XCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const r = await fetch(`${BASE}api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminKyc() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [viewKyc, setViewKyc] = useState<any>(null);
  const [rejectKycId, setRejectKycId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/admin/kyc?page=${page}&status=${statusFilter}`)
      .then(setData).catch(() => toast({ title: "Load failed", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(kycId: number) {
    setProcessing(true);
    try {
      await apiFetch(`/admin/kyc/${kycId}/status`, { method: "PATCH", body: JSON.stringify({ status: "approved" }) });
      toast({ title: "KYC approved" });
      setViewKyc(null);
      load();
    } catch (err: any) {
      toast({ title: err.message ?? "Approval failed", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectKycId || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await apiFetch(`/admin/kyc/${rejectKycId}/status`, { method: "PATCH", body: JSON.stringify({ status: "rejected", rejectionReason: rejectReason }) });
      toast({ title: "KYC rejected" });
      setRejectKycId(null);
      setRejectReason("");
      setViewKyc(null);
      load();
    } catch (err: any) {
      toast({ title: err.message ?? "Rejection failed", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59] flex items-center gap-2"><ShieldCheck size={22} /> KYC Review</h1>
          <p className="text-sm text-muted-foreground">Verify member identity documents and bank details</p>
        </div>

        <div className="flex gap-3 mb-6">
          {["pending", "approved", "rejected"].map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
              className={statusFilter === s ? "bg-[#0F2D59]" : ""}
              onClick={() => { setStatusFilter(s); setPage(1); }}>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Aadhaar</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">PAN</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Submitted</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                {!loading && (data?.data?.length ?? 0) === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No KYC submissions</td></tr>
                )}
                {data?.data?.map((k: any) => (
                  <tr key={k.userId} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-xs text-[#0F2D59] font-mono">{k.memberId}</p>
                      <p className="text-xs text-muted-foreground">{k.memberName}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{k.aadhaarNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono">{k.panNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${STATUS_COLORS[k.status] ?? "bg-gray-100 text-gray-700"}`}>{k.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {k.submittedAt ? new Date(k.submittedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" variant="ghost" className="gap-1 text-xs text-blue-600" onClick={() => setViewKyc(k)}>
                          <Eye size={12} /> View
                        </Button>
                        {k.status === "pending" && (
                          <>
                            <Button size="sm" className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" disabled={processing} onClick={() => handleApprove(k.userId)}>
                              <CheckCircle size={12} /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => setRejectKycId(k.userId)}>
                              <XCircle size={12} /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.total > 20 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{data.total} total · Page {page}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View KYC Modal */}
      <Dialog open={!!viewKyc} onOpenChange={() => setViewKyc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>KYC Details — {viewKyc?.memberId}</DialogTitle></DialogHeader>
          {viewKyc && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-[#0F2D59] mb-1">Identity</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Aadhaar</span><span className="font-mono">{viewKyc.aadhaarNumber ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">PAN</span><span className="font-mono">{viewKyc.panNumber ?? "—"}</span></div>
                </div>
                <div className="flex gap-2 mt-2">
                  {viewKyc.aadhaarFrontUrl && <a href={viewKyc.aadhaarFrontUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Aadhaar Front</a>}
                  {viewKyc.aadhaarBackUrl && <a href={viewKyc.aadhaarBackUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Aadhaar Back</a>}
                  {viewKyc.panPhotoUrl && <a href={viewKyc.panPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">PAN Photo</a>}
                </div>
              </div>
              <div>
                <p className="font-semibold text-[#0F2D59] mb-1">Bank & UPI</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span>{viewKyc.bankName ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Holder</span><span>{viewKyc.holderName ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-mono">{viewKyc.accountNumber ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">IFSC</span><span className="font-mono">{viewKyc.ifscCode ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">UPI ID</span><span>{viewKyc.upiId ?? "—"}</span></div>
                </div>
              </div>
              {viewKyc.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                  <strong>Rejection reason:</strong> {viewKyc.rejectionReason}
                </div>
              )}
            </div>
          )}
          {viewKyc?.status === "pending" && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setViewKyc(null)}>Close</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" disabled={processing} onClick={() => handleApprove(viewKyc.userId)}>
                <CheckCircle size={14} /> Approve
              </Button>
              <Button variant="destructive" className="gap-1" onClick={() => { setRejectKycId(viewKyc.userId); setViewKyc(null); }}>
                <XCircle size={14} /> Reject
              </Button>
            </DialogFooter>
          )}
          {viewKyc?.status !== "pending" && <DialogFooter><Button variant="outline" onClick={() => setViewKyc(null)}>Close</Button></DialogFooter>}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectKycId} onOpenChange={() => { setRejectKycId(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject KYC</DialogTitle></DialogHeader>
          <div>
            <label className="text-sm font-medium">Reason for rejection</label>
            <Input className="mt-2" placeholder="Enter reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectKycId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectReason.trim()}>
              {processing ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
