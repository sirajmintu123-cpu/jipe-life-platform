import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getToken, formatINR } from "@/lib/api";
import { 
  CheckCircle, 
  XCircle, 
  KeyRound, 
  Eye, 
  Search, 
  TrendingUp, 
  Package, 
  Users, 
  Calendar, 
  DollarSign,
  CheckSquare,
  Square,
  Clock,
  User,
  UserCheck,
  FileText,
  Gift
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

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

const PKG_PRICES: Record<string, { price: number; bv: number }> = {
  starter: { price: 1100, bv: 0.5 },
  smart: { price: 2100, bv: 1 },
  silver: { price: 5200, bv: 2 },
  gold: { price: 10100, bv: 4 },
};

interface Request {
  id: number;
  memberId: string;
  userName: string;
  package: string;
  quantity: number;
  totalAmount: number;
  paymentReference: string;
  status: string;
  paymentStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  processedAt: string | null;
  sponsorId: string;
  sponsorName: string;
  pinsGenerated: number;
  approvedBy: string;
  approvedAt: string;
}

export default function AdminPinRequests() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [viewRequest, setViewRequest] = useState<Request | null>(null);
  const [approveRequest, setApproveRequest] = useState<Request | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/admin/epin-requests?page=${page}&status=${statusFilter}&search=${searchTerm}`)
      .then(setData).catch(() => toast({ title: "Load failed", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, statusFilter, searchTerm]);

  useEffect(() => { load(); }, [load]);

  // Calculate statistics
  const requests = data?.data || [];
  const totalRequests = data?.total || 0;
  const pendingCount = requests.filter((r: any) => r.status === "pending").length;
  const approvedCount = requests.filter((r: any) => r.status === "approved").length;
  const rejectedCount = requests.filter((r: any) => r.status === "rejected").length;

  // Today's collection
  const today = new Date().toDateString();
  const todayRequests = requests.filter((r: any) => 
    new Date(r.createdAt).toDateString() === today && r.status === "approved"
  );
  const todayCollection = todayRequests.reduce((sum: number, r: any) => sum + r.totalAmount, 0);

  // Package statistics
  const packageStats = requests.reduce((acc: any, r: any) => {
    if (r.status === "pending") {
      acc[r.package] = (acc[r.package] || 0) + 1;
    }
    return acc;
  }, {});

  // Revenue breakdown
  const revenueBreakdown = requests.reduce((acc: any, r: any) => {
    if (r.status === "approved") {
      acc[r.package] = (acc[r.package] || 0) + r.totalAmount;
    }
    return acc;
  }, {});

  const totalRevenue = Object.values(revenueBreakdown).reduce((a: number, b: number) => a + b, 0);

  // Total BV
  const totalBV = requests.reduce((acc: number, r: any) => {
    if (r.status === "approved") {
      const pkg = PKG_PRICES[r.package as keyof typeof PKG_PRICES];
      return acc + (pkg ? pkg.bv * r.quantity : 0);
    }
    return acc;
  }, 0);

  // Monthly revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = requests.reduce((acc: number, r: any) => {
    const date = new Date(r.createdAt);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear && r.status === "approved") {
      return acc + r.totalAmount;
    }
    return acc;
  }, 0);

  async function handleApprove(id: number) {
    const request = requests.find((r: any) => r.id === id);
    setApproveRequest(request);
  }

  async function confirmApprove() {
    if (!approveRequest) return;
    setProcessing(true);
    try {
      const result = await apiFetch(`/admin/epin-requests/${approveRequest.id}/approve`, { method: "POST" });
      toast({ 
        title: `Approved! ${result.pinsGenerated} E-Pins credited to user.`,
        description: `Approved by: ${result.approvedBy} on ${new Date(result.approvedAt).toLocaleString()}`
      });
      setApproveRequest(null);
      load();
    } catch (err: any) {
      toast({ title: err.message ?? "Approval failed", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectId || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await apiFetch(`/admin/epin-requests/${rejectId}/reject`, { method: "POST", body: JSON.stringify({ reason: rejectReason }) });
      toast({ title: "Request rejected" });
      setRejectId(null);
      setRejectReason("");
      load();
    } catch (err: any) {
      toast({ title: err.message ?? "Rejection failed", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkApprove() {
    if (selectedRequests.length === 0) {
      toast({ title: "Please select requests to approve", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      const result = await apiFetch(`/admin/epin-requests/bulk-approve`, { 
        method: "POST", 
        body: JSON.stringify({ ids: selectedRequests }) 
      });
      toast({ title: `${result.approvedCount} requests approved successfully!` });
      setSelectedRequests([]);
      load();
    } catch (err: any) {
      toast({ title: err.message ?? "Bulk approval failed", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }

  function toggleSelectAll() {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map((r: any) => r.id));
    }
  }

  function toggleSelect(id: number) {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter(sid => sid !== id));
    } else {
      setSelectedRequests([...selectedRequests, id]);
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59] flex items-center gap-2">
            <KeyRound size={22} /> Pin Requests
          </h1>
          <p className="text-sm text-muted-foreground">Review and approve member E-Pin purchase requests</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Requests</p>
                  <p className="text-2xl font-bold text-amber-600">{loading ? <Skeleton className="h-8 w-16" /> : pendingCount}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Approved Requests</p>
                  <p className="text-2xl font-bold text-emerald-600">{loading ? <Skeleton className="h-8 w-16" /> : approvedCount}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={18} className="text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rejected Requests</p>
                  <p className="text-2xl font-bold text-red-600">{loading ? <Skeleton className="h-8 w-16" /> : rejectedCount}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle size={18} className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Today's Collection</p>
                  <p className="text-2xl font-bold text-blue-600">{loading ? <Skeleton className="h-8 w-16" /> : formatINR(todayCollection)}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Statistics & Revenue Breakdown */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-gradient-to-r from-[#0F2D59]/5 to-[#1a4a7a]/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={16} className="text-[#0F2D59]" />
                  <p className="text-sm font-semibold text-[#0F2D59]">Package Statistics</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Starter</p>
                    <p className="font-bold text-sky-600">{packageStats?.starter || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Smart</p>
                    <p className="font-bold text-blue-600">{packageStats?.smart || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Silver</p>
                    <p className="font-bold text-gray-600">{packageStats?.silver || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gold</p>
                    <p className="font-bold text-amber-600">{packageStats?.gold || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50/50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700">Revenue Breakdown</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Starter</p>
                    <p className="font-bold text-sky-600 text-sm">{formatINR(revenueBreakdown?.starter || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Smart</p>
                    <p className="font-bold text-blue-600 text-sm">{formatINR(revenueBreakdown?.smart || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Silver</p>
                    <p className="font-bold text-gray-600 text-sm">{formatINR(revenueBreakdown?.silver || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gold</p>
                    <p className="font-bold text-amber-600 text-sm">{formatINR(revenueBreakdown?.gold || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Business Metrics */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Total Requests</p>
                <p className="text-lg font-bold text-purple-600">{totalRequests}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                <p className="text-lg font-bold text-indigo-600">{formatINR(monthlyRevenue)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-white">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Total BV Generated</p>
                <p className="text-lg font-bold text-teal-600">{totalBV}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-white">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold text-rose-600">{formatINR(totalRevenue)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          {["pending", "approved", "rejected"].map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
              className={statusFilter === s ? "bg-[#0F2D59]" : ""}
              onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Member ID, Name, or Payment Ref..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              data-testid="input-request-search"
            />
          </div>
          {statusFilter === "pending" && selectedRequests.length > 0 && (
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleBulkApprove}
              disabled={processing}
            >
              <CheckSquare size={14} className="mr-2" />
              Approve Selected ({selectedRequests.length})
            </Button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  {statusFilter === "pending" && (
                    <th className="w-8 px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedRequests.length === requests.length && requests.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Member</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Package</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Qty</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">BV</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Payment Ref</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Payment Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Requested</th>
                  {(statusFilter === "pending" || statusFilter === "approved") && (
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={12} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                {!loading && (data?.data?.length ?? 0) === 0 && (
                  <tr><td colSpan={12} className="text-center py-8 text-muted-foreground">No pin requests</td></tr>
                )}
                {data?.data?.map((r: any) => {
                  const pkg = PKG_PRICES[r.package as keyof typeof PKG_PRICES];
                  const totalBV = pkg ? pkg.bv * r.quantity : 0;
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      {statusFilter === "pending" && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(r.id)}
                            onChange={() => toggleSelect(r.id)}
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <p className="font-bold text-xs text-[#0F2D59] font-mono">{r.memberId}</p>
                        <p className="text-xs text-muted-foreground">{r.userName}</p>
                        {r.sponsorId && (
                          <p className="text-xs text-muted-foreground">Sponsor: {r.sponsorId}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`text-xs ${PKG_COLORS[r.package ?? "smart"]}`}>
                          {PKG_LABELS[r.package ?? "smart"]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{r.quantity}</td>
                      <td className="px-4 py-3 text-center font-semibold text-indigo-600">{totalBV}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatINR(r.totalAmount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate" title={r.paymentReference}>
                        {r.paymentReference}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`text-xs ${PAYMENT_STATUS_COLORS[r.paymentStatus || "pending"]}`}>
                          {(r.paymentStatus || "pending").charAt(0).toUpperCase() + (r.paymentStatus || "pending").slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`text-xs ${STATUS_COLORS[r.status]}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Badge>
                        {r.rejectionReason && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <p className="text-xs text-red-500 mt-0.5 cursor-help">View reason</p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{r.rejectionReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {r.status === "approved" && r.approvedBy && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            By: {r.approvedBy}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </td>
                      {(statusFilter === "pending" || statusFilter === "approved") && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1 text-xs"
                              onClick={() => setViewRequest(r)}
                            >
                              <Eye size={12} /> View
                            </Button>
                            {statusFilter === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" 
                                  disabled={processing} 
                                  onClick={() => handleApprove(r.id)}
                                >
                                  <CheckCircle size={12} /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="gap-1 text-xs" 
                                  onClick={() => setRejectId(r.id)}
                                >
                                  <XCircle size={12} /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
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

      {/* View Details Modal */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0F2D59] flex items-center gap-2">
              <User size={18} /> Request Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the pin request
            </DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Member ID</p>
                  <p className="font-bold text-[#0F2D59]">{viewRequest.memberId}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Member Name</p>
                  <p className="font-bold">{viewRequest.userName}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Package</p>
                  <Badge className={`text-xs ${PKG_COLORS[viewRequest.package]}`}>
                    {PKG_LABELS[viewRequest.package]}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-bold">{viewRequest.quantity}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-emerald-600">{formatINR(viewRequest.totalAmount)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Payment Reference</p>
                  <p className="font-mono text-xs">{viewRequest.paymentReference}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Request Date</p>
                  <p className="text-sm">{formatDate(viewRequest.createdAt)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`text-xs ${STATUS_COLORS[viewRequest.status]}`}>
                    {viewRequest.status.charAt(0).toUpperCase() + viewRequest.status.slice(1)}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Sponsor ID</p>
                  <p className="font-mono text-xs">{viewRequest.sponsorId || "N/A"}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Sponsor Name</p>
                  <p className="text-sm">{viewRequest.sponsorName || "N/A"}</p>
                </div>
                {viewRequest.status === "approved" && (
                  <>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Approved By</p>
                      <p className="text-sm font-medium">{viewRequest.approvedBy || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Approved On</p>
                      <p className="text-sm">{viewRequest.approvedAt ? formatDate(viewRequest.approvedAt) : "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                      <p className="text-xs text-muted-foreground">Generated Pins</p>
                      <p className="font-bold text-emerald-600">{viewRequest.pinsGenerated || 0}</p>
                    </div>
                  </>
                )}
                {viewRequest.rejectionReason && (
                  <div className="bg-red-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-muted-foreground">Rejection Reason</p>
                    <p className="text-red-600">{viewRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Modal */}
      <Dialog open={!!approveRequest} onOpenChange={() => setApproveRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#0F2D59]">Approve Request?</DialogTitle>
            <DialogDescription>
              Confirm approval of this pin request
            </DialogDescription>
          </DialogHeader>
          {approveRequest && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Member</p>
                  <p className="font-medium">{approveRequest.memberId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{approveRequest.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Package</p>
                  <Badge className={`text-xs ${PKG_COLORS[approveRequest.package]}`}>
                    {PKG_LABELS[approveRequest.package]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-bold">{approveRequest.quantity}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold text-emerald-600">{formatINR(approveRequest.totalAmount)}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <CheckCircle size={12} className="inline mr-1" />
                  This will generate {approveRequest.quantity} E-Pin(s) and credit to {approveRequest.userName}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveRequest(null)}>Cancel</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white" 
              onClick={confirmApprove} 
              disabled={processing}
            >
              {processing ? "Processing..." : "Approve Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => { setRejectId(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Pin Request #{rejectId}</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">Reason for rejection</label>
            <Input className="mt-2" placeholder="Enter reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectReason.trim()}>
              {processing ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}