import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "blue" | "green" | "gold" | "red";
  sub?: string;
}

const accentMap = {
  blue: { bg: "bg-blue-50", icon: "text-[#0F2D59]", border: "border-blue-100", badge: "bg-[#0F2D59]" },
  green: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100", badge: "bg-emerald-500" },
  gold: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100", badge: "bg-amber-500" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100", badge: "bg-red-500" },
};

export default function StatCard({ label, value, icon: Icon, accent = "blue", sub }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div className={`bg-white rounded-xl border ${a.border} p-5 flex items-start gap-4 shadow-sm`}>
      <div className={`${a.bg} p-3 rounded-lg flex-shrink-0`}>
        <Icon size={20} className={a.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-tight">{label}</p>
        <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground mt-0.5 break-all leading-tight" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
