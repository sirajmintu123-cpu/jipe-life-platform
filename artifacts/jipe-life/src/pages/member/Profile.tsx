import MemberLayout from "@/components/MemberLayout";
import { useGetUserProfile, useUpdateUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { User, Building2, Smartphone } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
});

const PKG_COLORS: Record<string, string> = {
  smart: "bg-blue-100 text-blue-800",
  silver: "bg-gray-100 text-gray-800",
  gold: "bg-amber-100 text-amber-800",
};

export default function Profile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: user, isLoading } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const update = useUpdateUserProfile();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
        bankAccount: user.bankAccount ?? "",
        bankName: user.bankName ?? "",
        ifscCode: user.ifscCode ?? "",
        upiId: user.upiId ?? "",
      });
    }
  }, [user]);

  function onSubmit(values: z.infer<typeof schema>) {
    update.mutate({ data: values }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
        toast({ title: "Profile updated successfully!" });
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    });
  }

  return (
    <MemberLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0F2D59]">My Profile</h1>
          <p className="text-sm text-muted-foreground">Account details and payment information</p>
        </div>

        {/* Member Info Card */}
        {isLoading ? <Skeleton className="h-24 rounded-xl mb-6" /> : (
          <div className="bg-gradient-to-br from-[#0F2D59] to-[#1a3f70] rounded-xl p-6 text-white mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-400/20 rounded-full flex items-center justify-center">
                <User size={24} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-black">{user?.name}</p>
                <p className="text-blue-300 text-sm font-mono">{user?.memberId}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className={`text-xs ${PKG_COLORS[user?.package ?? "smart"]}`}>
                    {user?.package?.toUpperCase()} Package
                  </Badge>
                  <Badge className="text-xs bg-emerald-400/20 text-emerald-300 border-emerald-400/30">
                    {user?.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal */}
              <div>
                <h3 className="font-bold text-[#0F2D59] flex items-center gap-2 mb-4">
                  <User size={16} /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} data-testid="input-profile-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input {...field} data-testid="input-profile-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm mt-1 text-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-bold text-[#0F2D59] flex items-center gap-2 mb-4">
                  <Building2 size={16} /> Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="bankAccount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl><Input {...field} placeholder="Bank account number" data-testid="input-bank-account" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bankName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. SBI, HDFC" data-testid="input-bank-name" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ifscCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. SBIN0001234" className="uppercase" data-testid="input-ifsc" /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-bold text-[#0F2D59] flex items-center gap-2 mb-4">
                  <Smartphone size={16} /> UPI
                </h3>
                <FormField control={form.control} name="upiId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI ID</FormLabel>
                    <FormControl><Input {...field} placeholder="name@upi" data-testid="input-upi" /></FormControl>
                  </FormItem>
                )} />
              </div>

              <Button
                type="submit"
                className="bg-[#0F2D59] hover:bg-[#1a3f70] text-white"
                disabled={update.isPending}
                data-testid="button-save-profile"
              >
                {update.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </MemberLayout>
  );
}
