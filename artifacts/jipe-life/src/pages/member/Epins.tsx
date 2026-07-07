import MemberLayout from "@/components/MemberLayout";
import { useListMyEpins, useGetEpinHistory, useTransferEpin, getListMyEpinsQueryKey, getGetEpinHistoryQueryKey } from "@workspace/api-client-react";
import { formatINR } from "@/lib/api";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Send } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  unused: "bg-emerald-100 text-emerald-800",
  used: "bg-gray-100 text-gray-700",
  transferred: "bg-blue-100 text-blue-800",
};

const PKG_COLORS: Record<string, string> = {
  smart: "border-blue-200 bg-blue-50 text-blue-800",
  silver: "border-gray-200 bg-gray-50 text-gray-800",
  gold: "border-amber-200 bg-amber-50 text-amber-800",
};

const transferSchema = z.object({
  pinId: z.number({ required_error: "Select a pin" }),
  recipientMemberId: z.string().min(4, "Enter recipient member ID"),
  otp: z.string().min(4, "Enter OTP").default("000000"),
});

export default function Epins() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("unused");
  const transfer = useTransferEpin();

  const { data: pins, isLoading: pinsLoading } = useListMyEpins(
    { status: statusFilter as any },
    { query: { queryKey: getListMyEpinsQueryKey({ status: statusFilter as any }) } }
  );

  const { data: history, isLoading: histLoading } = useGetEpinHistory({
    query: { queryKey: getGetEpinHistoryQueryKey() }
  });

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: { recipientMemberId: "", otp: "000000" },
  });

  function onTransfer(values: z.infer<typeof transferSchema>) {
    transfer.mutate({ data: values }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListMyEpinsQueryKey({}) });
        toast({ title: "E-Pin transferred successfully!" });
        form.reset();
      },
      onError: (err: any) => {
        toast({ title: "Transfer failed", description: err?.data?.error, variant: "destructive" });
      },
    });
  }

  const unusedPins = pins?.filter(p => p.status === "unused") ?? [];

  return (
    <MemberLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">E-Pin Manager</h1>
          <p className="text-sm text-muted-foreground">View, use, and transfer your E-Pins</p>
        </div>

        <Tabs defaultValue="pins">
          <TabsList className="mb-6">
            <TabsTrigger value="pins" data-testid="tab-my-pins">My Pins</TabsTrigger>
            <TabsTrigger value="transfer" data-testid="tab-transfer">Transfer Pin</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="pins">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-[#0F2D59]">My E-Pins</h3>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unused">Unused</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="divide-y divide-border">
                {pinsLoading && <div className="p-4"><Skeleton className="h-16 w-full" /></div>}
                {!pinsLoading && (pins?.length ?? 0) === 0 && (
                  <div className="p-8 text-center text-muted-foreground">No E-Pins found</div>
                )}
                {pins?.map(pin => (
                  <div key={pin.id} className="p-4 flex items-center gap-4" data-testid={`pin-row-${pin.id}`}>
                    <div className={`px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tracking-widest ${PKG_COLORS[pin.package] ?? ""}`}>
                      {pin.pin}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{pin.package?.toUpperCase()}</Badge>
                        <span className="text-xs text-muted-foreground">{formatINR(pin.packagePrice)} · {pin.bv} BV</span>
                      </div>
                    </div>
                    <Badge className={`text-xs ${STATUS_COLORS[pin.status] ?? ""}`}>{pin.status}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => { navigator.clipboard.writeText(pin.pin); toast({ title: "Copied!" }); }}
                      data-testid={`copy-pin-${pin.id}`}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transfer">
            <div className="bg-white rounded-xl border border-border p-6 max-w-md">
              <h3 className="font-bold text-[#0F2D59] mb-4">Transfer E-Pin to Downline</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onTransfer)} className="space-y-4">
                  <FormField control={form.control} name="pinId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Pin to Transfer</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v, 10))}>
                        <FormControl>
                          <SelectTrigger data-testid="select-pin">
                            <SelectValue placeholder="Choose an unused pin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unusedPins.length === 0 && <SelectItem value="none" disabled>No unused pins</SelectItem>}
                          {unusedPins.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.pin} — {p.package?.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="recipientMemberId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Member ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. JL123456" data-testid="input-recipient" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button
                    type="submit"
                    className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white gap-2"
                    disabled={transfer.isPending}
                    data-testid="button-transfer"
                  >
                    <Send size={14} />
                    {transfer.isPending ? "Transferring..." : "Transfer Pin"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-[#0F2D59]">Pin History</h3>
              </div>
              <div className="divide-y divide-border">
                {histLoading && <div className="p-4"><Skeleton className="h-12 w-full" /></div>}
                {!histLoading && (history?.length ?? 0) === 0 && (
                  <div className="p-8 text-center text-muted-foreground">No history yet</div>
                )}
                {history?.map(h => (
                  <div key={h.id} className="p-4 flex items-center gap-4" data-testid={`history-row-${h.id}`}>
                    <code className="text-xs bg-gray-50 px-2 py-1 rounded font-mono">{h.pin}</code>
                    <Badge variant="outline" className="text-xs">{h.package?.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground flex-1">{h.action}</span>
                    <span className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MemberLayout>
  );
}
