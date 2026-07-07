import jipeLogo from "@assets/1779039528949_1779256247873.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { setAuth } from "@/lib/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";

const schema = z.object({
  memberId: z.string().min(1, "Admin ID is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useAdminLogin();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { memberId: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    login.mutate({ data: values }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user.role);
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({ title: "Admin login failed", description: "Invalid credentials.", variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#0F2D59] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <img src={jipeLogo} alt="Jipe Life" className="h-14 w-auto mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-bold text-[#0F2D59]">Admin Control Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Jipe Life Administration</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="memberId" render={({ field }) => (
              <FormItem>
                <FormLabel>Admin ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Admin member ID" data-testid="input-admin-id" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Admin password" data-testid="input-admin-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={login.isPending}
              data-testid="button-admin-submit"
            >
              {login.isPending ? "Authenticating..." : "Access Admin Panel"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-[#0F2D59]">
            ← Member Login
          </Link>
        </div>
      </div>
    </div>
  );
}
