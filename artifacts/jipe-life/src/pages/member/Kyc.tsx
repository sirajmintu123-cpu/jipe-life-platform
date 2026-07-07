import MemberLayout from "@/components/MemberLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/api";
import { ShieldCheck, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  not_submitted: { label: "Not Submitted", color: "bg-gray-100 text-gray-700", icon: AlertCircle, desc: "Please complete and submit your KYC details." },
  pending: { label: "Pending Review", color: "bg-amber-100 text-amber-800", icon: Clock, desc: "Your KYC is under review. Fields are locked." },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2, desc: "Your KYC has been verified." },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: AlertCircle, desc: "Your KYC was rejected. Please resubmit." },
};

export default function Kyc() {
  const { toast } = useToast();
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    aadhaarNumber: "", aadhaarFrontUrl: "", aadhaarBackUrl: "",
    panNumber: "", panPhotoUrl: "",
    bankName: "", holderName: "", accountNumber: "", ifscCode: "", upiId: "",
  });

  useEffect(() => {
    apiFetch("/kyc").then(data => {
      setKyc(data);
      if (data && data.status !== "not_submitted") {
        setForm({
          aadhaarNumber: data.aadhaarNumber ?? "",
          aadhaarFrontUrl: data.aadhaarFrontUrl ?? "",
          aadhaarBackUrl: data.aadhaarBackUrl ?? "",
          panNumber: data.panNumber ?? "",
          panPhotoUrl: data.panPhotoUrl ?? "",
          bankName: data.bankName ?? "",
          holderName: data.holderName ?? "",
          accountNumber: data.accountNumber ?? "",
          ifscCode: data.ifscCode ?? "",
          upiId: data.upiId ?? "",
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const status = kyc?.status ?? "not_submitted";
  const locked = status === "pending" || status === "approved";
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setSaving(true);
    try {
      const data = await apiFetch("/kyc", { method: "PUT", body: JSON.stringify(form) });
      setKyc(data);
      toast({ title: "KYC submitted for review" });
    } catch (err: any) {
      toast({ title: err.message ?? "Submission failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <MemberLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></MemberLayout>;

  return (
    <MemberLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59] flex items-center gap-2"><ShieldCheck size={22} /> KYC Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete identity and bank verification</p>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${status === "approved" ? "bg-emerald-50 border border-emerald-200" : status === "rejected" ? "bg-red-50 border border-red-200" : status === "pending" ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-200"}`}>
          <Icon size={20} className={status === "approved" ? "text-emerald-600" : status === "rejected" ? "text-red-600" : status === "pending" ? "text-amber-600" : "text-gray-500"} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Status:</span>
              <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{cfg.desc}</p>
            {status === "rejected" && kyc?.rejectionReason && (
              <p className="text-xs text-red-600 mt-1 font-medium">Reason: {kyc.rejectionReason}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Aadhaar */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-bold text-[#0F2D59] mb-4 text-sm uppercase tracking-wide">Aadhaar Card</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Aadhaar Number (12 digits)</label>
                <Input className="mt-1.5" placeholder="XXXX XXXX XXXX" maxLength={14} value={form.aadhaarNumber}
                  onChange={e => setForm(f => ({ ...f, aadhaarNumber: e.target.value }))} disabled={locked} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Front Photo URL</label>
                  <Input className="mt-1.5" placeholder="Paste Google Drive / cloud link" value={form.aadhaarFrontUrl}
                    onChange={e => setForm(f => ({ ...f, aadhaarFrontUrl: e.target.value }))} disabled={locked} />
                </div>
                <div>
                  <label className="text-sm font-medium">Back Photo URL</label>
                  <Input className="mt-1.5" placeholder="Paste Google Drive / cloud link" value={form.aadhaarBackUrl}
                    onChange={e => setForm(f => ({ ...f, aadhaarBackUrl: e.target.value }))} disabled={locked} />
                </div>
              </div>
            </div>
          </div>

          {/* PAN */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-bold text-[#0F2D59] mb-4 text-sm uppercase tracking-wide">PAN Card</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">PAN Number</label>
                <Input className="mt-1.5" placeholder="ABCDE1234F" maxLength={10} value={form.panNumber}
                  onChange={e => setForm(f => ({ ...f, panNumber: e.target.value.toUpperCase() }))} disabled={locked} />
              </div>
              <div>
                <label className="text-sm font-medium">PAN Photo URL</label>
                <Input className="mt-1.5" placeholder="Paste Google Drive / cloud link" value={form.panPhotoUrl}
                  onChange={e => setForm(f => ({ ...f, panPhotoUrl: e.target.value }))} disabled={locked} />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-bold text-[#0F2D59] mb-4 text-sm uppercase tracking-wide">Bank & UPI Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Bank Name</label>
                <Input className="mt-1.5" placeholder="e.g. State Bank of India" value={form.bankName}
                  onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} disabled={locked} />
              </div>
              <div>
                <label className="text-sm font-medium">Account Holder Name</label>
                <Input className="mt-1.5" placeholder="As per bank records" value={form.holderName}
                  onChange={e => setForm(f => ({ ...f, holderName: e.target.value }))} disabled={locked} />
              </div>
              <div>
                <label className="text-sm font-medium">Account Number</label>
                <Input className="mt-1.5" placeholder="Enter account number" value={form.accountNumber}
                  onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} disabled={locked} />
              </div>
              <div>
                <label className="text-sm font-medium">IFSC Code</label>
                <Input className="mt-1.5" placeholder="SBIN0000000" value={form.ifscCode}
                  onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value.toUpperCase() }))} disabled={locked} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">UPI ID</label>
                <Input className="mt-1.5" placeholder="yourname@upi" value={form.upiId}
                  onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))} disabled={locked} />
              </div>
            </div>
          </div>

          {!locked && (
            <Button type="submit" className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white" disabled={saving}>
              {saving ? "Submitting..." : "Submit KYC for Verification"}
            </Button>
          )}
        </form>
      </div>
    </MemberLayout>
  );
}
