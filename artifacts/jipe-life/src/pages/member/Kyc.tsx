import MemberLayout from "@/components/MemberLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/api";
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Banknote,
  User,
  CreditCard,
  Building2,
  Smartphone,
  Eye,
  Download,
  X,
  ChevronRight,
  Check,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import FileUploader from "@/components/Upload/FileUploader";

const BASE = import.meta.env.BASE_URL;

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const r = await fetch(`${BASE}api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any; desc: string; expected?: string }
> = {
  not_submitted: {
    label: "Not Submitted",
    color: "bg-gray-100 text-gray-700",
    icon: AlertCircle,
    desc: "Please complete and submit your KYC details.",
  },
  pending: {
    label: "Verification In Progress",
    color: "bg-amber-100 text-amber-800",
    icon: Clock,
    desc: "Our team is reviewing your documents.",
    expected: "Expected completion: 24-48 Hours",
  },
  approved: {
    label: "Verified",
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
    desc: "Your account has been verified. You can now enjoy all benefits.",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    desc: "Your KYC was rejected. Please resubmit.",
  },
};

const STEPS = [
  { id: "aadhaar", label: "Aadhaar", icon: ShieldCheck },
  { id: "pan", label: "PAN", icon: CreditCard },
  { id: "bank", label: "Bank", icon: Building2 },
  { id: "submit", label: "Submit", icon: CheckCircle2 },
];

export default function Kyc() {
  const { toast } = useToast();
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");
  const [form, setForm] = useState({
    aadhaarNumber: "",
    aadhaarFrontUrl: "",
    aadhaarBackUrl: "",
    panNumber: "",
    panPhotoUrl: "",
    bankName: "",
    holderName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  useEffect(() => {
    apiFetch("/kyc")
      .then((data) => {
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
      })
      .catch(() => setLoading(false));
  }, []);

  const status = kyc?.status ?? "not_submitted";
  const locked = status === "pending" || status === "approved";
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  // Step completion status
  const stepStatus = {
    aadhaar: !!(form.aadhaarNumber && form.aadhaarFrontUrl && form.aadhaarBackUrl),
    pan: !!(form.panNumber && form.panPhotoUrl),
    bank: !!(form.bankName && form.holderName && form.accountNumber && form.ifscCode),
    submit: status === "approved" || status === "pending",
  };

  const currentStep = stepStatus.aadhaar ? (stepStatus.pan ? (stepStatus.bank ? 3 : 2) : 1) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setSaving(true);
    try {
      const data = await apiFetch("/kyc", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setKyc(data);
      toast({ title: "KYC submitted for review" });
    } catch (err: any) {
      toast({ title: err.message ?? "Submission failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <MemberLayout>
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </MemberLayout>
    );

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F2D59] via-[#1a3f70] to-[#2563EB] rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black">KYC Verification</h1>
                <p className="text-blue-200 text-sm mt-1">
                  Secure your account by verifying your identity and bank details.
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-blue-300">
                  <Clock size={14} />
                  <span>⏱ Estimated Time: 3-5 Minutes</span>
                </div>
              </div>
            </div>
            <Badge className={`text-sm px-4 py-2 ${cfg.color} border-0 shadow-lg`}>
              <Icon size={16} className="inline mr-1" />
              {cfg.label}
            </Badge>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-xl border border-white/40">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = stepStatus[step.id as keyof typeof stepStatus];
              const isActive = index === currentStep;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : isActive
                          ? "bg-[#0F2D59] text-white shadow-lg shadow-[#0F2D59]/30"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? <Check size={18} /> : <step.icon size={18} />}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCompleted || isActive ? "text-[#0F2D59]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: isCompleted ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Aadhaar Section */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-2 rounded-xl">
                <ShieldCheck size={24} className="text-[#0F2D59]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F2D59] text-lg">Aadhaar Verification</h3>
                <p className="text-xs text-muted-foreground">Verify your Aadhaar details</p>
              </div>
              {stepStatus.aadhaar && (
                <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">
                  <Check size={14} className="mr-1" /> Verified
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard size={16} /> Aadhaar Number (12 digits)
                </label>
                <Input
                  className="mt-1.5"
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                  value={form.aadhaarNumber}
                  onChange={(e) => setForm((f) => ({ ...f, aadhaarNumber: e.target.value }))}
                  disabled={locked}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  
                  <FileUploader
                    label="Aadhaar Front"
                    folder="kyc"
                    value={form.aadhaarFrontUrl}
                    disabled={locked}
                    onUploaded={(url) =>
                      setForm((f) => ({
                        ...f,
                        aadhaarFrontUrl: url,
                      }))
                    }
                  />
                  {form.aadhaarFrontUrl && (
                    <div className="relative mt-2 group cursor-pointer" onClick={() => {
                      setPreviewImage(form.aadhaarFrontUrl);
                      setPreviewLabel("Aadhaar Front");
                    }}>
                      <img
                        src={`${BASE}${form.aadhaarFrontUrl}`}
                        alt="Aadhaar Front"
                        className="h-40 w-full rounded-xl border object-cover transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <Eye size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs">
                        Click to view full
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  
                  <FileUploader
                    label="Aadhaar Back"
                    folder="kyc"
                    value={form.aadhaarBackUrl}
                    disabled={locked}
                    onUploaded={(url) =>
                      setForm((f) => ({
                        ...f,
                        aadhaarBackUrl: url,
                      }))
                    }
                  />
                  {form.aadhaarBackUrl && (
                    <div className="relative mt-2 group cursor-pointer" onClick={() => {
                      setPreviewImage(form.aadhaarBackUrl);
                      setPreviewLabel("Aadhaar Back");
                    }}>
                      <img
                        src={`${BASE}${form.aadhaarBackUrl}`}
                        alt="Aadhaar Back"
                        className="h-40 w-full rounded-xl border object-cover transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <Eye size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs">
                        Click to view full
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PAN Section */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-50 p-2 rounded-xl">
                <CreditCard size={24} className="text-[#0F2D59]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F2D59] text-lg">PAN Verification</h3>
                <p className="text-xs text-muted-foreground">Verify your PAN details</p>
              </div>
              {stepStatus.pan && (
                <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">
                  <Check size={14} className="mr-1" /> Verified
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard size={16} /> PAN Number
                </label>
                <Input
                  className="mt-1.5 uppercase"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={form.panNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, panNumber: e.target.value.toUpperCase() }))
                  }
                  disabled={locked}
                />
              </div>

              <div>
             
                <FileUploader
                  label="PAN Card"
                  folder="kyc"
                  value={form.panPhotoUrl}
                  disabled={locked}
                  onUploaded={(url) =>
                    setForm((f) => ({
                      ...f,
                      panPhotoUrl: url,
                    }))
                  }
                />
                {form.panPhotoUrl && (
                  <div className="relative mt-2 group cursor-pointer" onClick={() => {
                    setPreviewImage(form.panPhotoUrl);
                    setPreviewLabel("PAN Card");
                  }}>
                    <img
                      src={`${BASE}${form.panPhotoUrl}`}
                      alt="PAN Card"
                      className="h-40 w-full rounded-xl border object-cover transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <Eye size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs">
                      Click to view full
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-50 p-2 rounded-xl">
                <Building2 size={24} className="text-[#0F2D59]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F2D59] text-lg">Bank & UPI Details</h3>
                <p className="text-xs text-muted-foreground">Verify your payment details</p>
              </div>
              {stepStatus.bank && (
                <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">
                  <Check size={14} className="mr-1" /> Verified
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 size={16} /> Bank Name
                </label>
                <Input
                  className="mt-1.5"
                  placeholder="e.g. State Bank of India"
                  value={form.bankName}
                  onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                  disabled={locked}
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <User size={16} /> Account Holder Name
                </label>
                <Input
                  className="mt-1.5"
                  placeholder="As per bank records"
                  value={form.holderName}
                  onChange={(e) => setForm((f) => ({ ...f, holderName: e.target.value }))}
                  disabled={locked}
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard size={16} /> Account Number
                </label>
                <Input
                  className="mt-1.5"
                  placeholder="Enter account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  disabled={locked}
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Banknote size={16} /> IFSC Code
                </label>
                <Input
                  className="mt-1.5 uppercase"
                  placeholder="SBIN0000000"
                  value={form.ifscCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ifscCode: e.target.value.toUpperCase() }))
                  }
                  disabled={locked}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Smartphone size={16} /> UPI ID
                </label>
                <Input
                  className="mt-1.5"
                  placeholder="yourname@upi"
                  value={form.upiId}
                  onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))}
                  disabled={locked}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!locked && (
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/40 -mx-4 px-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0F2D59] to-[#2563EB] hover:from-[#1a3f70] hover:to-[#1a3f70] text-white py-6 text-lg font-bold shadow-xl shadow-[#0F2D59]/30"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    ⏳ Uploading Documents...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} className="mr-2" />
                    🔒 Submit KYC for Verification
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Your documents are encrypted and secure
              </p>
            </div>
          )}
        </form>

        {/* Status Banner */}
        <div
          className={`mt-6 rounded-2xl p-6 backdrop-blur-xl border ${
            status === "approved"
              ? "bg-emerald-50/80 border-emerald-200"
              : status === "rejected"
              ? "bg-red-50/80 border-red-200"
              : status === "pending"
              ? "bg-amber-50/80 border-amber-200"
              : "bg-gray-50/80 border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl ${
                status === "approved"
                  ? "bg-emerald-100"
                  : status === "rejected"
                  ? "bg-red-100"
                  : status === "pending"
                  ? "bg-amber-100"
                  : "bg-gray-100"
              }`}
            >
              <Icon
                size={24}
                className={
                  status === "approved"
                    ? "text-emerald-600"
                    : status === "rejected"
                    ? "text-red-600"
                    : status === "pending"
                    ? "text-amber-600"
                    : "text-gray-500"
                }
              />
            </div>
            <div>
              <h4 className="font-bold text-[#0F2D59]">{cfg.label}</h4>
              <p className="text-sm text-muted-foreground">{cfg.desc}</p>
              {status === "pending" && cfg.expected && (
                <p className="text-xs text-amber-600 mt-1 font-medium">{cfg.expected}</p>
              )}
              {status === "rejected" && kyc?.rejectionReason && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Reason: {kyc.rejectionReason}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => {
            setPreviewImage(null);
            setPreviewLabel("");
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-[#0F2D59] flex items-center gap-2">
                <ImageIcon size={20} />
                {previewLabel}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `${BASE}${previewImage}`;
                    link.download = `${previewLabel}.jpg`;
                    link.click();
                  }}
                >
                  <Download size={16} className="mr-1" /> Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPreviewImage(null);
                    setPreviewLabel("");
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh]">
              <img
                src={`${BASE}${previewImage}`}
                alt={previewLabel}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </MemberLayout>
  );
}