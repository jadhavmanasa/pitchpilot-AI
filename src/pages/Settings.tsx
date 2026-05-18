import { motion } from "motion/react";
import { CreditCard, Globe, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type SettingItem = {
  label: string;
  value: string;
  type: "text" | "badge" | "status";
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, deleteCurrentUser } = useAuth();

  const sections: { title: string; icon: typeof User; items: SettingItem[] }[] = [
    {
      title: "User profile",
      icon: User,
      items: [
        { label: "Account name", value: user?.name || "PitchPilot User", type: "text" },
        { label: "Verification", value: "Verified", type: "badge" },
        { label: "Email address", value: user?.email || "Not available", type: "text" },
      ],
    },
    {
      title: "Interface",
      icon: Globe,
      items: [
        { label: "Language", value: "English", type: "text" },
        { label: "Visual style", value: "Light Studio", type: "text" },
        { label: "Smart layouts", value: "Enabled", type: "status" },
      ],
    },
    {
      title: "Security",
      icon: Shield,
      items: [
        { label: "Local session", value: "Active", type: "status" },
        { label: "Deck storage", value: "Private", type: "status" },
        { label: "Logout control", value: "Enabled", type: "status" },
      ],
    },
    {
      title: "Workspace",
      icon: CreditCard,
      items: [
        { label: "Plan type", value: "Demo Pro", type: "text" },
        { label: "AI model", value: "Gemini with fallback", type: "text" },
        { label: "Export support", value: "PDF + PPTX", type: "text" },
      ],
    },
  ];

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Delete this account and all saved decks from this browser?");
    if (!confirmed) return;

    deleteCurrentUser();
    navigate("/");
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-950">Workspace preferences</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Manage account details and local app behavior.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sections.map((section, index) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="panel p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <section.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-slate-950">{section.title}</h3>
            </div>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{item.label}</span>
                  {item.type === "badge" ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">{item.value}</span>
                  ) : item.type === "status" ? (
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {item.value}
                    </span>
                  ) : (
                    <span className="max-w-[220px] truncate text-sm font-extrabold text-slate-700">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl font-extrabold text-rose-900">Delete account</h3>
            <p className="mt-1 text-sm font-semibold text-rose-700">Permanently delete this local account and saved decks.</p>
          </div>
          <button type="button" onClick={handleDeleteAccount} className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-rose-700">
            Confirm delete
          </button>
        </div>
      </div>
    </div>
  );
}
