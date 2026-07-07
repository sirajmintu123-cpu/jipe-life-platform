import { Link, useLocation } from "wouter";
import { useState } from "react";
import jipeLogo from "@assets/1779039528949_1779256247873.png";
import { clearAuth } from "@/lib/api";
import { useLogoutUser } from "@workspace/api-client-react";
import {
  LayoutDashboard, Network, CreditCard, Wallet, Star, BarChart3,
  KeyRound, User, LogOut, Menu, X, TrendingUp, ChevronRight, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { path: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/member/binary", label: "Binary Engine", icon: Network },
  { path: "/member/binary-tree", label: "Team Tree", icon: TrendingUp },
  { path: "/member/cto", label: "CTO Royalty", icon: BarChart3 },
  { path: "/member/rewards", label: "Rewards", icon: Star },
  { path: "/member/epins", label: "E-Pin Manager", icon: KeyRound },
  { path: "/member/pin-request", label: "Request Pins", icon: CreditCard },
  { path: "/member/wallet", label: "Wallet", icon: Wallet },
  { path: "/member/kyc", label: "KYC Verification", icon: ShieldCheck },
  { path: "/member/profile", label: "Profile", icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useLogoutUser();

  function handleLogout() {
    logout.mutate({});
    clearAuth();
    setLocation("/");
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[#1a3f70]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={jipeLogo} alt="Jipe Life" className="w-full h-full object-contain p-0.5" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Jipe Life</p>
            <p className="text-blue-300 text-xs">Member Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location === path || location.startsWith(path + "/");
          return (
            <Link key={path} href={path}>
              <div
                data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                  active
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} className={active ? "text-amber-400" : "text-blue-300 group-hover:text-white"} />
                <span className="text-sm font-medium">{label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-amber-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1a3f70]">
        <Button
          variant="ghost"
          onClick={handleLogout}
          data-testid="button-logout"
          className="w-full justify-start text-blue-300 hover:text-white hover:bg-white/10 gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0F2D59] flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0F2D59] flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-border flex items-center px-4 md:px-6 gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
            Active Member
          </Badge>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
