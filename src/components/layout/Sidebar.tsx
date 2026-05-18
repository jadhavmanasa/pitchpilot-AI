import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Download,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: PlusCircle, label: "Generate", path: "/generate" },
  { icon: BookOpen, label: "My Decks", path: "/my-decks" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Download, label: "Exports", path: "/exports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/90 p-4 backdrop-blur-xl md:flex md:flex-col">
      <Link to="/" className="mb-8 flex items-center gap-3 rounded-2xl px-2 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-xl font-extrabold tracking-tight text-slate-950">PitchPilot</p>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-700">AI Studio</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950",
                isActive && "active-glow"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-teal-700" : "text-slate-400 group-hover:text-teal-700")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-200">Generator Ready</p>
        </div>
        <p className="text-sm font-semibold leading-5 text-slate-200">
          Turn a startup idea into slides, scripts, scores, and exports from one workspace.
        </p>
      </div>
    </aside>
  );
}
