import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useEffect, useState } from "react";
import { useRegisterUser, useValidateSponsor, useValidateEpin, getValidateSponsorQueryKey, getValidateEpinQueryKey } from "@workspace/api-client-react";
import { setAuth } from "@/lib/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";

const PACKAGE_COLORS: Record<string, string> = {
  smart: "bg-blue-100 text-blue-800",
  silver: "bg-gray-100 text-gray-800",
  gold: "bg-amber-100 text-amber-800",
};

const PACKAGE_PRICES: Record<string, string> = {
  smart: "₹2,100 | 1 BV",
  silver: "₹5,200 | 2 BV",
  gold: "₹10,100 | 4 BV",
};

const schema = z.object({
  sponsorId: z.string().min(1, "Sponsor ID is required"),
  epin: z.string().min(10, "E-Pin must be 10-12 characters").max(12, "E-Pin must be 10-12 characters"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.enum(["left", "right"]),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegisterUser();
  const [sponsorInput, setSponsorInput] = useState("");
  const [epinInput, setEpinInput] = useState("");

  const sponsorQuery = useValidateSponsor(
    { sponsorId: sponsorInput },
    { query: { enabled: sponsorInput.length >= 4, queryKey: getValidateSponsorQueryKey({ sponsorId: sponsorInput }), retry: false } }
  );

  const epinQuery = useValidateEpin(
    { pin: epinInput },
    { query: { enabled: epinInput.length >= 10, queryKey: getValidateEpinQueryKey({ pin: epinInput }), retry: false } }
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { sponsorId: "", epin: "", name: "", email: "", phone: "", password: "", position: "left" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    register.mutate({ data: values }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user.role);
        toast({ title: "Registration successful!", description: `Welcome, ${data.user.name}! Your Member ID: ${data.user.memberId}` });
        setLocation("/member/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Registration failed", description: err?.data?.error ?? "Please check your details.", variant: "destructive" });
      },
    });
  }

  const sponsorValid = !!sponsorQuery.data;
  const epinValid = epinQuery.data?.valid;
  const detectedPackage = epinQuery.data?.package;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2D59] to-[#1a3f70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ArrowLeft size={14} /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0F2D59]">Create Account</h1>
            <p className="text-xs text-muted-foreground">E-Pin registration — no free signups</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Sponsor ID */}
            <FormField control={form.control} name="sponsorId" render={({ field }) => (
              <FormItem>
                <FormLabel>Sponsor ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter sponsor member ID"
                    data-testid="input-sponsor-id"
                    onChange={(e) => { field.onChange(e); setSponsorInput(e.target.value); }}
                  />
                </FormControl>
                {sponsorInput.length >= 4 && (
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    {sponsorQuery.isLoading && <Loader2 size={12} className="animate-spin text-blue-500" />}
                    {sponsorValid && <><CheckCircle size={12} className="text-emerald-500" /><span className="text-emerald-600 font-medium">{sponsorQuery.data?.name}</span></>}
                    {sponsorQuery.isError && <><XCircle size={12} className="text-red-500" /><span className="text-red-500">Sponsor not found</span></>}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )} />

            {/* E-Pin */}
            <FormField control={form.control} name="epin" render={({ field }) => (
              <FormItem>
                <FormLabel>E-Pin</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your 10-12 character E-Pin"
                    className="uppercase tracking-widest font-mono"
                    data-testid="input-epin"
                    onChange={(e) => { field.onChange(e.target.value.toUpperCase()); setEpinInput(e.target.value.toUpperCase()); }}
                  />
                </FormControl>
                {epinInput.length >= 10 && (
                  <div className="flex items-center gap-2 mt-1">
                    {epinQuery.isLoading && <Loader2 size={12} className="animate-spin text-blue-500" />}
                    {epinValid && detectedPackage && (
                      <>
                        <CheckCircle size={12} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium">Valid E-Pin</span>
                        <Badge className={`text-xs ${PACKAGE_COLORS[detectedPackage]}`}>
                          {detectedPackage.toUpperCase()} — {PACKAGE_PRICES[detectedPackage]}
                        </Badge>
                      </>
                    )}
                    {epinQuery.isError && <><XCircle size={12} className="text-red-500" /><span className="text-xs text-red-500">Invalid or used E-Pin</span></>}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} placeholder="Your name" data-testid="input-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} placeholder="Mobile number" data-testid="input-phone" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input {...field} type="email" placeholder="email@example.com" data-testid="input-email" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input {...field} type="password" placeholder="Min. 6 characters" data-testid="input-password" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="position" render={({ field }) => (
                <FormItem>
                  <FormLabel>Position in Sponsor Tree</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-position">
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="left">Left Leg</SelectItem>
                      <SelectItem value="right">Right Leg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white mt-2"
              disabled={register.isPending || !sponsorValid || !epinValid}
              data-testid="button-register"
            >
              {register.isPending ? "Registering..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already a member?{" "}
          <Link href="/" className="text-[#0F2D59] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
