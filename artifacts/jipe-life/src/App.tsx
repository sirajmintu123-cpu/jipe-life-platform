import Presentation from "@/pages/Presentation";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { getToken, getRole } from "@/lib/api";


// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";

// Member pages
import Dashboard from "@/pages/member/Dashboard";
import Binary from "@/pages/member/Binary";
import BinaryTree from "@/pages/member/BinaryTree";
import Cto from "@/pages/member/Cto";
import Rewards from "@/pages/member/Rewards";
import Epins from "@/pages/member/Epins";
import EpinRequest from "@/pages/member/EpinRequest";
import Wallet from "@/pages/member/Wallet";
import Kyc from "@/pages/member/Kyc";
import Profile from "@/pages/member/Profile";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminEpins from "@/pages/admin/Epins";
import AdminPinRequests from "@/pages/admin/PinRequests";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import AdminBinaryControl from "@/pages/admin/BinaryControl";
import AdminCtoControl from "@/pages/admin/CtoControl";
import AdminKyc from "@/pages/admin/Kyc";
import RewardManagementPage from "@/pages/admin/rewards/RewardManagementPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const [, setLocation] = useLocation();
  const token = getToken();
  const role = getRole();

  useEffect(() => {
    if (!token) {
      setLocation(adminOnly ? "/admin" : "/");
      return;
    }
    if (adminOnly && role !== "admin") {
      setLocation("/member/dashboard");
      return;
    }
    if (!adminOnly && role === "admin") {
      setLocation("/admin/dashboard");
    }
  }, [token, role, adminOnly, setLocation]);

  if (!token) return null;
  if (adminOnly && role !== "admin") return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Presentation} />
<Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={AdminLogin} />

      {/* Member */}
      <Route path="/member/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/member/binary">{() => <ProtectedRoute component={Binary} />}</Route>
      <Route path="/member/binary-tree">{() => <ProtectedRoute component={BinaryTree} />}</Route>
      <Route path="/member/cto">{() => <ProtectedRoute component={Cto} />}</Route>
      <Route path="/member/rewards">{() => <ProtectedRoute component={Rewards} />}</Route>
      <Route path="/member/epins">{() => <ProtectedRoute component={Epins} />}</Route>
      <Route path="/member/pin-request">{() => <ProtectedRoute component={EpinRequest} />}</Route>
      <Route path="/member/wallet">{() => <ProtectedRoute component={Wallet} />}</Route>
      <Route path="/member/kyc">{() => <ProtectedRoute component={Kyc} />}</Route>
      <Route path="/member/profile">{() => <ProtectedRoute component={Profile} />}</Route>

      {/* Admin */}
      <Route path="/admin/dashboard">{() => <ProtectedRoute component={AdminDashboard} adminOnly />}</Route>
      <Route path="/admin/users">{() => <ProtectedRoute component={AdminUsers} adminOnly />}</Route>
      <Route path="/admin/epins">{() => <ProtectedRoute component={AdminEpins} adminOnly />}</Route>
      <Route path="/admin/pin-requests">{() => <ProtectedRoute component={AdminPinRequests} adminOnly />}</Route>
      <Route path="/admin/withdrawals">{() => <ProtectedRoute component={AdminWithdrawals} adminOnly />}</Route>
      <Route path="/admin/kyc">{() => <ProtectedRoute component={AdminKyc} adminOnly />}</Route>
      <Route path="/admin/binary">{() => <ProtectedRoute component={AdminBinaryControl} adminOnly />}</Route>
      <Route path="/admin/cto">{() => <ProtectedRoute component={AdminCtoControl} adminOnly />}</Route>
  <Route path="/admin/rewards">
  {() => (
    <ProtectedRoute
      component={RewardManagementPage}
      adminOnly
    />
  )}
</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
