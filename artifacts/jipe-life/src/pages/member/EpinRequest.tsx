import MemberLayout from "@/components/MemberLayout";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getToken, formatINR } from "@/lib/api";
import { KeyRound, Plus } from "lucide-react";

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

const PACKAGES: Record<string, { price: number; bv: number; label: string }> = {
  smart: { price: 2100, bv: 1, label: "Smart — ₹2,100 (1 BV)" },
  silver: { price: 5200, bv: 2, label: "Silver — ₹5,200 (2 BV)" },
  gold: { price: 10100, bv: 4, label: "Gold — ₹10,100 (4 BV)" },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const PKG_COLORS: Record<string, string> = {
  smart: "bg-blue-100 text-blue-800",
  silver: "bg-gray-100 text-gray-700",
  gold: "bg-amber-100 text-amber-800",
};

export default function EpinRequest() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pkg, setPkg] = useState("smart");
  const [quantity, setQuantity] = useState(1);
  const [paymentRef, setPaymentRef] = useState("");

  const loadRequests = useCallback(() => {
    apiFetch("/epins/my-requests").then(setRequests).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const total = PACKAGES[pkg]?.price * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentRef.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch("/epins/request", {
        method: "POST",
        body: JSON.stringify({ package: pkg, quantity, paymentReference: paymentRef }),
      });
      toast({ title: "Pin request submitted! Admin will review shortly." });
      setShowForm(false);
      setPkg("smart");
      setQuantity(1);
      setPaymentRef("");
      loadRequests();
    } catch (err: any) {
      toast({ title: err.message ?? "Submission failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MemberLayout>
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0F2D59] flex items-center gap-2"><KeyRound size={22} /> Request E-Pins</h1>
            <p className="text-sm text-muted-foreground">Request E-Pins by making payment and submitting reference</p>
          </div>
          <Button className="bg-[#0F2D59] hover:bg-[#1a3f70] gap-2" onClick={() => setShowForm(v => !v)}>
            <Plus size={16} /> New Request
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
            <h3 className="font-bold text-[#0F2D59]">New Pin Request</h3>

            <div>
              <label className="text-sm font-medium">Package</label>
              <Select value={pkg} onValueChange={setPkg}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PACKAGES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Number of Pins</label>
              <Input type="number" min={1} max={100} value={quantity} className="mt-1.5"
                onChange={e => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-amber-800">Total Amount Payable: {formatINR(total)}</p>
              <p className="text-amber-700 text-xs mt-0.5">Transfer this amount and paste UTR / transaction ID below</p>
            </div>

            <div>
              <label className="text-sm font-medium">Payment Reference / UTR Number</label>
              <Input className="mt-1.5" placeholder="Enter UTR, transaction ID or payment reference"
                value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-[#10B981] hover:bg-emerald-700 text-white flex-1" disabled={submitting || !paymentRef.trim()}>
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-[#0F2D59]">My Pin Requests</h3>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No requests yet. Click "New Request" to get started.</div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((r: any) => (
                <div key={r.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${PKG_COLORS[r.package]}`}>{r.package?.toUpperCase()}</Badge>
                      <span className="text-sm font-bold">{r.quantity} pin{r.quantity > 1 ? "s" : ""}</span>
                      <span className="text-sm text-muted-foreground">· {formatINR(r.totalAmount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Ref: {r.paymentReference}</p>
                    {r.rejectionReason && <p className="text-xs text-red-500 mt-0.5">Rejected: {r.rejectionReason}</p>}
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${STATUS_COLORS[r.status]}`}>{r.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
