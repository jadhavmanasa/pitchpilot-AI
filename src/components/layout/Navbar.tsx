import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getSavedDecks } from "../../lib/deckStorage";
import { cn } from "../../lib/utils";

const mobileItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: PlusCircle, label: "Create", path: "/generate" },
  { icon: BookOpen, label: "Decks", path: "/my-decks" },
  { icon: BarChart3, label: "Stats", path: "/analytics" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [decks, setDecks] = useState(getSavedDecks());

  useEffect(() => {
    setDecks(getSavedDecks());
    setQuery("");
    setShowNotifications(false);
  }, [location.pathname]);

  const title = useMemo(() => {
    if (location.pathname.startsWith("/generate")) return "Create Deck";
    if (location.pathname.startsWith("/my-decks")) return "Deck Library";
    if (location.pathname.startsWith("/analytics")) return "Analytics";
    if (location.pathname.startsWith("/exports")) return "Exports";
    if (location.pathname.startsWith("/settings")) return "Settings";
    if (location.pathname.startsWith("/viewer")) return "Deck Viewer";
    return "Dashboard";
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    return decks
      .filter((deck) => deck.startupName.toLowerCase().includes(term) || deck.industry.toLowerCase().includes(term))
      .slice(0, 5);
  }, [decks, query]);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/85 px-4 py-3 text-slate-950 backdrop-blur-xl md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow hidden md:block">Workspace</p>
          <h1 className="truncate font-display text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
        </div>

        <div className="relative hidden min-w-72 max-w-xl flex-1 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search decks..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 transition-all placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
          />
          {query.trim() && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10">
              {searchResults.length > 0 ? (
                searchResults.map((deck) => (
                  <Link
                    key={deck.id}
                    to={`/viewer/${deck.id}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-900"
                  >
                    <FileText className="h-4 w-4 text-teal-700" />
                    <span className="min-w-0 flex-1 truncate">{deck.startupName}</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{deck.industry}</span>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">No decks found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="icon-btn relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-extrabold text-slate-900">{user?.name || "My Account"}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{user?.email || "User"}</p>
            </div>
          </div>

          <button type="button" onClick={handleLogout} className="icon-btn" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-4 top-16 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-2xl shadow-slate-950/10 md:right-8">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Notifications</p>
          <div className="rounded-xl bg-teal-50 p-3 text-xs font-semibold text-teal-900">
            Your workspace is ready. Generated decks are stored in this browser account.
          </div>
        </div>
      )}

      <nav className="mt-3 grid grid-cols-4 gap-2 md:hidden">
        {mobileItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-extrabold text-slate-500",
                isActive && "border-teal-200 bg-teal-50 text-teal-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
