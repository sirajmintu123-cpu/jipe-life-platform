import AdminLayout from "@/components/AdminLayout";
import { useAdminGenerateEpins, useAdminListEpins, useAdminAssignEpin, getAdminListEpinsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Zap, Download, Package, Clock, CheckCircle, ArrowRightCircle, TrendingUp, User, FileText, X, Search } from "lucide-react";

const generateSchema = z.object({
  package: z.enum(["starter", "smart", "silver", "gold"]),
  quantity: z.number().min(1).max(500),
});

const assignSchema = z.object({
  memberId: z.string().min(1, "Enter member ID"),
  pinIds: z.array(z.number()),
});

const STATUS_COLORS: Record<string, string> = {
  unused: "bg-emerald-100 text-emerald-800 border-emerald-200",
  used: "bg-gray-100 text-gray-700 border-gray-200",
  transferred: "bg-blue-100 text-blue-800 border-blue-200",
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

const PKG_PRICES: Record<string, string> = {
  starter: "₹1,100 · 0.5 BV",
  smart: "₹2,100 · 1 BV",
  silver: "₹5,200 · 2 BV",
  gold: "₹10,100 · 4 BV",
};

export default function AdminEpins() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [packageFilter, setPackageFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selectedPins, setSelectedPins] = useState<number[]>([]);
  const [generatedPins, setGeneratedPins] = useState<any[]>([]);
  const generateEpins = useAdminGenerateEpins();
  const assignEpin = useAdminAssignEpin();

  const { data, isLoading } = useAdminListEpins(
    { page, status: statusFilter, package: packageFilter, search: search || undefined },
    { query: { queryKey: getAdminListEpinsQueryKey({ page, status: statusFilter, package: packageFilter, search: search || undefined }) } }
  );

  const genForm = useForm<z.infer<typeof generateSchema>>({
    resolver: zodResolver(generateSchema),
    defaultValues: { package: "starter", quantity: 10 },
  });

  const assignForm = useForm<{ memberId: string }>({
    defaultValues: { memberId: "" },
  });

  // Calculate statistics
  const totalPins = data?.data?.length ?? 0;
  const unusedCount = data?.data?.filter((p: any) => p.status === "unused").length ?? 0;
  const usedCount = data?.data?.filter((p: any) => p.status === "used").length ?? 0;
  const transferredCount = data?.data?.filter((p: any) => p.status === "transferred").length ?? 0;

  // Package-wise revenue
  const revenueByPackage = data?.data?.reduce((acc: any, pin: any) => {
    if (pin.status === "used" || pin.status === "transferred") {
      acc[pin.package] = (acc[pin.package] || 0) + (pin.packagePrice || 0);
    }
    return acc;
  }, {});

  const totalRevenue = Object.values(revenueByPackage || {}).reduce((a: number, b: number) => a + b, 0);

  function onGenerate(values: z.infer<typeof generateSchema>) {
    generateEpins.mutate({ data: values }, {
      onSuccess: (pins) => {
        qc.invalidateQueries({ queryKey: getAdminListEpinsQueryKey({}) });
        setGeneratedPins(pins);
        toast({ title: `${pins.length} E-Pins generated successfully!` });
      },
      onError: () => toast({ title: "Generation failed", variant: "destructive" }),
    });
  }

  async function onAssign() {
    const memberId = assignForm.getValues("memberId");
    if (!memberId?.trim() || selectedPins.length === 0) {
      toast({ title: "Select pins and enter a Member ID", variant: "destructive" });
      return;
    }
    try {
      const token = (await import("@/lib/api")).getToken();
      const base = import.meta.env.BASE_URL;
      const r = await fetch(`${base}api/admin/epins/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ memberId: memberId.trim(), pinIds: selectedPins }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Assignment failed");
      qc.invalidateQueries({ queryKey: getAdminListEpinsQueryKey({}) });
      toast({ title: `${selectedPins.length} pins assigned to ${memberId}` });
      setSelectedPins([]);
      assignForm.reset({ memberId: "" });
    } catch (err: any) {
      toast({ title: err.message ?? "Assignment failed", variant: "destructive" });
    }
  }

  function handleExportCSV() {
    const headers = ["Pin", "Package", "Price", "BV", "Status", "Assigned To", "Created At"];
    const rows = data?.data?.map((p: any) => [
      p.pin,
      p.package,
      p.packagePrice,
      p.bv,
      p.status,
      p.assignedToName || "N/A",
      new Date(p.createdAt).toLocaleDateString(),
    ]) || [];
    
    const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `epins-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "E-Pins exported successfully" });
  }

  function handleDownloadTxt() {
    const pins = generatedPins.map((p: any) => p.pin).join("\n") || "";
    const blob = new Blob([pins], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-pins-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Generated pins downloaded successfully" });
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter(undefined);
    setPackageFilter(undefined);
    setPage(1);
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0F2D59]">E-Pin Management</h1>
            <p className="text-sm text-muted-foreground">Generate, assign, and track E-Pins</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileText size={14} className="mr-2" />
            Export CSV
          </Button>
        </div>

        {/* E-Pin Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Pins</p>
                  <p className="text-2xl font-bold text-[#0F2D59]">{isLoading ? <Skeleton className="h-8 w-16" /> : totalPins}</p>
                </div>
                <div className="w-10 h-10 bg-[#0F2D59]/10 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-[#0F2D59]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unused</p>
                  <p className="text-2xl font-bold text-emerald-600">{isLoading ? <Skeleton className="h-8 w-16" /> : unusedCount}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Used</p>
                  <p className="text-2xl font-bold text-blue-600">{isLoading ? <Skeleton className="h-8 w-16" /> : usedCount}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={18} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Transferred</p>
                  <p className="text-2xl font-bold text-orange-600">{isLoading ? <Skeleton className="h-8 w-16" /> : transferredCount}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ArrowRightCircle size={18} className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* E-Pin Revenue Summary */}
        {!isLoading && data?.data && data.data.length > 0 && (
          <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-[#0F2D59]/5 to-[#1a4a7a]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[#0F2D59]" />
                <p className="text-sm font-semibold text-[#0F2D59]">Revenue Summary</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Starter</p>
                  <p className="font-bold text-sky-600">{formatINR(revenueByPackage?.starter || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Smart</p>
                  <p className="font-bold text-blue-600">{formatINR(revenueByPackage?.smart || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Silver</p>
                  <p className="font-bold text-gray-600">{formatINR(revenueByPackage?.silver || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gold</p>
                  <p className="font-bold text-amber-600">{formatINR(revenueByPackage?.gold || 0)}</p>
                </div>
                <div className="border-l pl-3">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="font-bold text-[#0F2D59] text-lg">{formatINR(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="list">
          <TabsList className="mb-6">
            <TabsTrigger value="list">All Pins</TabsTrigger>
            <TabsTrigger value="generate">Generate Pins</TabsTrigger>
            <TabsTrigger value="assign">Assign Pins</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by PIN..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  data-testid="input-pin-search"
                />
              </div>

              <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? undefined : v); setPage(1); }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unused">Unused</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>

              <Select value={packageFilter || "all"} onValueChange={(v) => { setPackageFilter(v === "all" ? undefined : v); setPage(1); }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="smart">Smart</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>

              {(search || statusFilter || packageFilter) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 px-3">
                  <X size={14} className="mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              {selectedPins.length > 0 && (
                <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-blue-700 font-medium">{selectedPins.length} pins selected</span>
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Input
                      type="text"
                      placeholder="Member ID (e.g. JL000001)"
                      className="w-48 h-7 text-xs"
                      {...assignForm.register("memberId")}
                    />
                    <Button size="sm" className="h-7 text-xs bg-[#0F2D59]" onClick={onAssign}>
                      Assign Selected
                    </Button>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="w-8 px-4 py-3">
                        <input type="checkbox" onChange={(e) => {
                          if (e.target.checked) setSelectedPins(data?.data?.map(p => p.id) ?? []);
                          else setSelectedPins([]);
                        }} />
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pin Code</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Package</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Assigned To</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Generated</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Used</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && <tr><td colSpan={8} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>}
                    {!isLoading && (data?.data?.length ?? 0) === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No E-Pins found</td></tr>
                    )}
                    {data?.data?.map((pin: any) => (
                      <tr key={pin.id} className="border-b border-border last:border-0 hover:bg-gray-50" data-testid={`epin-row-${pin.id}`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedPins.includes(pin.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedPins(prev => [...prev, pin.id]);
                              else setSelectedPins(prev => prev.filter(id => id !== pin.id));
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold tracking-widest text-[#0F2D59]">{pin.pin}</td>
                        <td className="px-4 py-3 text-center">
                          <div>
                            <Badge className={`text-xs ${PKG_COLORS[pin.package ?? "starter"]}`}>
                              {PKG_LABELS[pin.package ?? "starter"]}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{PKG_PRICES[pin.package ?? "starter"]}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`text-xs ${STATUS_COLORS[pin.status ?? "unused"]}`}>
                            {pin.status?.charAt(0).toUpperCase() + pin.status?.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {pin.assignedToName ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{pin.assignedToName}</span>
                              {pin.assignedToMemberId && (
                                <span className="text-xs text-muted-foreground">{pin.assignedToMemberId}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {new Date(pin.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {pin.usedAt ? new Date(pin.usedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="text-muted-foreground"
                            onClick={() => { navigator.clipboard.writeText(pin.pin); toast({ title: "Copied!" }); }}>
                            <Copy size={12} />
                          </Button>
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
          </TabsContent>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-bold text-[#0F2D59] mb-4 flex items-center gap-2"><Zap size={16} /> Bulk Generate E-Pins</h3>
                <Form {...genForm}>
                  <form onSubmit={genForm.handleSubmit(onGenerate)} className="space-y-4">
                    <FormField control={genForm.control} name="package" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-gen-package"><SelectValue placeholder="Select package" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="starter">Starter — ₹1,100 (0.5 BV)</SelectItem>
                            <SelectItem value="smart">Smart — ₹2,100 (1 BV)</SelectItem>
                            <SelectItem value="silver">Silver — ₹5,200 (2 BV)</SelectItem>
                            <SelectItem value="gold">Gold — ₹10,100 (4 BV)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={genForm.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (max 500)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={500} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} data-testid="input-gen-quantity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white" disabled={generateEpins.isPending} data-testid="button-generate">
                      {generateEpins.isPending ? "Generating..." : "Generate E-Pins"}
                    </Button>
                  </form>
                </Form>
              </div>

              {generatedPins.length > 0 && (
                <div className="bg-white rounded-xl border border-emerald-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-emerald-700">Generated Pins ({generatedPins.length})</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
                        const text = generatedPins.map(p => p.pin).join("\n");
                        navigator.clipboard.writeText(text);
                        toast({ title: "All pins copied!" });
                      }}>
                        <Copy size={12} /> Copy All
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleDownloadTxt}>
                        <Download size={12} /> Download TXT
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {generatedPins.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <code className="text-xs font-mono font-bold tracking-widest">{p.pin}</code>
                        <Badge className={`text-xs ${PKG_COLORS[p.package ?? "starter"]}`}>
                          {PKG_LABELS[p.package ?? "starter"]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assign">
            <div className="bg-white rounded-xl border border-border p-6 max-w-md">
              <h3 className="font-bold text-[#0F2D59] mb-2">Assign E-Pins to User</h3>
              <p className="text-sm text-muted-foreground mb-4">Select pins from the "All Pins" tab, then enter the user ID to assign them.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Member ID</label>
                  <Input type="text" placeholder="Enter User ID or Username (e.g. JL000001)" className="mt-1.5" {...assignForm.register("memberId")} data-testid="input-assign-userid" />
                </div>
                <p className="text-xs text-muted-foreground">Selected pins: {selectedPins.length}</p>
                <Button className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white" onClick={onAssign} disabled={assignEpin.isPending || selectedPins.length === 0} data-testid="button-assign">
                  {assignEpin.isPending ? "Assigning..." : `Assign ${selectedPins.length} Pin(s)`}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}