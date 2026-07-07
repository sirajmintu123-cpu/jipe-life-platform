import jipeLogo from "@assets/1779039528949_1779256247873.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { setAuth } from "@/lib/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Shield, TrendingUp, Award } from "lucide-react";

const schema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLoginUser();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { memberId: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    login.mutate({ data: values }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user.role);
        if (data.user.role === "admin") {
          setLocation("/admin/dashboard");
        } else {
          setLocation("/member/dashboard");
        }
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid Member ID or password.", variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2D59] via-[#1a3f70] to-[#0F2D59] flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              <img src={jipeLogo} alt="Jipe Life" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">Jipe Life</p>
              <p className="text-blue-300 text-sm">Jipe Global Service Limited</p>
            </div>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Build Your Network.<br />
            <span className="text-amber-400">Earn Together.</span>
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            A professional binary MLM platform with transparent earnings, CTO royalties, and lifetime milestone rewards.
          </p>
          <div className="space-y-4">
            {[
              { icon: Shield, text: "Secure E-Pin registration system" },
              { icon: TrendingUp, text: "Daily binary pair matching engine" },
              { icon: Award, text: "Lifetime reward milestones up to ₹11.5 Lakh" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-blue-100">
                <Icon size={16} className="text-amber-400 flex-shrink-0" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
          <div className="mb-6 text-center lg:hidden">
            <img src={jipeLogo} alt="Jipe Life" className="h-14 w-auto mx-auto mb-2 object-contain" />
            <p className="font-bold text-[#0F2D59]">Jipe Life Member Portal</p>
          </div>
          <h2 className="text-xl font-bold text-[#0F2D59] mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your member account</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="memberId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Member ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. JL123456" data-testid="input-member-id" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter your password" data-testid="input-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button
                type="submit"
                className="w-full bg-[#0F2D59] hover:bg-[#1a3f70] text-white"
                disabled={login.isPending}
                data-testid="button-submit"
              >
                {login.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              New member?{" "}
              <Link href="/register" className="text-[#0F2D59] font-semibold hover:underline">
                Register with E-Pin
              </Link>
            </p>
          </div>
          <div className="mt-3 text-center">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-[#0F2D59]">
              Admin Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
