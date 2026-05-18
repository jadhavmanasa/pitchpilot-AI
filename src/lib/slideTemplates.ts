import { SlideTemplateId } from "../types";

export interface SlideTemplate {
  id: SlideTemplateId;
  name: string;
  description: string;
  previewClass: string;
  frameClass: string;
  edgeClass: string;
  badgeClass: string;
  titleClass: string;
  subtitleClass: string;
  bulletClass: string;
  bulletIconClass: string;
  moreClass: string;
  visualPanelClass: string;
  chartPanelClass: string;
  imagePanelClass: string;
  footerClass: string;
  footerMutedClass: string;
  chartColors: string[];
  chartTick: string;
  chartTooltipBg: string;
  chartTooltipBorder: string;
  accent: string;
  pdf: {
    background: string;
    title: string;
    subtitle: string;
    body: string;
    muted: string;
    accent: string;
    panel: string;
    border: string;
  };
}

export const DEFAULT_TEMPLATE_ID: SlideTemplateId = "aurora";

export const slideTemplates: SlideTemplate[] = [
  {
    id: "aurora",
    name: "Aurora Dark",
    description: "Cinematic dark slides with teal highlights and polished investor energy.",
    previewClass: "bg-[linear-gradient(135deg,#0f172a_0%,#020617_58%,#042f2e_130%)]",
    frameClass: "bg-[linear-gradient(135deg,#0f172a_0%,#020617_58%,#042f2e_130%)] text-white",
    edgeClass: "from-transparent via-teal-300/40 to-transparent",
    badgeClass: "border-teal-300/25 bg-teal-300/10 text-teal-200",
    titleClass: "text-white",
    subtitleClass: "text-slate-400",
    bulletClass: "border-white/[0.06] bg-white/[0.035] hover:border-white/10",
    bulletIconClass: "text-teal-300",
    moreClass: "border-teal-300/15 bg-teal-300/10 text-teal-200",
    visualPanelClass: "border-white/10 bg-white/[0.04]",
    chartPanelClass: "bg-black/20",
    imagePanelClass: "border-white/5 bg-black/30",
    footerClass: "border-white/5",
    footerMutedClass: "text-slate-500",
    chartColors: ["#14b8a6", "#38bdf8", "#fb7185", "#f59e0b"],
    chartTick: "#64748b",
    chartTooltipBg: "#09090b",
    chartTooltipBorder: "rgba(255,255,255,0.1)",
    accent: "#14b8a6",
    pdf: {
      background: "#0f172a",
      title: "#ffffff",
      subtitle: "#2dd4bf",
      body: "#cbd5e1",
      muted: "#64748b",
      accent: "#14b8a6",
      panel: "#111827",
      border: "#1e293b",
    },
  },
  {
    id: "minimal",
    name: "Clean Minimal",
    description: "Bright, airy investor memo style with crisp typography and quiet structure.",
    previewClass: "bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_62%,#e0f2fe_130%)]",
    frameClass: "bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_62%,#e0f2fe_130%)] text-slate-950",
    edgeClass: "from-transparent via-sky-300/70 to-transparent",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-800",
    titleClass: "text-slate-950",
    subtitleClass: "text-slate-500",
    bulletClass: "border-slate-200/80 bg-white/80 shadow-sm hover:border-sky-200",
    bulletIconClass: "text-sky-600",
    moreClass: "border-sky-200 bg-sky-50 text-sky-800",
    visualPanelClass: "border-slate-200 bg-white/80 shadow-sm",
    chartPanelClass: "bg-slate-50",
    imagePanelClass: "border-slate-200 bg-white",
    footerClass: "border-slate-200",
    footerMutedClass: "text-slate-400",
    chartColors: ["#0284c7", "#10b981", "#f43f5e", "#f59e0b"],
    chartTick: "#94a3b8",
    chartTooltipBg: "#ffffff",
    chartTooltipBorder: "rgba(148,163,184,0.35)",
    accent: "#0284c7",
    pdf: {
      background: "#f8fafc",
      title: "#0f172a",
      subtitle: "#0369a1",
      body: "#334155",
      muted: "#64748b",
      accent: "#0284c7",
      panel: "#ffffff",
      border: "#cbd5e1",
    },
  },
  {
    id: "venture",
    name: "Bold Startup",
    description: "High-contrast founder pitch style with confident color blocks.",
    previewClass: "bg-[linear-gradient(135deg,#18181b_0%,#881337_62%,#fb923c_150%)]",
    frameClass: "bg-[linear-gradient(135deg,#18181b_0%,#881337_62%,#fb923c_150%)] text-white",
    edgeClass: "from-transparent via-orange-300/60 to-transparent",
    badgeClass: "border-orange-300/30 bg-orange-300/15 text-orange-100",
    titleClass: "text-white",
    subtitleClass: "text-orange-100/75",
    bulletClass: "border-white/10 bg-white/[0.07] hover:border-orange-200/30",
    bulletIconClass: "text-orange-300",
    moreClass: "border-orange-300/20 bg-orange-300/15 text-orange-100",
    visualPanelClass: "border-white/10 bg-black/20",
    chartPanelClass: "bg-black/25",
    imagePanelClass: "border-white/10 bg-black/30",
    footerClass: "border-white/10",
    footerMutedClass: "text-orange-100/45",
    chartColors: ["#fb923c", "#f43f5e", "#facc15", "#22c55e"],
    chartTick: "#fed7aa",
    chartTooltipBg: "#18181b",
    chartTooltipBorder: "rgba(251,146,60,0.35)",
    accent: "#fb923c",
    pdf: {
      background: "#881337",
      title: "#ffffff",
      subtitle: "#fed7aa",
      body: "#fff7ed",
      muted: "#fdba74",
      accent: "#fb923c",
      panel: "#9f1239",
      border: "#fb923c",
    },
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Magazine-like slides with cream paper, black ink, and sharp red accents.",
    previewClass: "bg-[linear-gradient(135deg,#fff7ed_0%,#fffbeb_58%,#fee2e2_125%)]",
    frameClass: "bg-[linear-gradient(135deg,#fff7ed_0%,#fffbeb_58%,#fee2e2_125%)] text-zinc-950",
    edgeClass: "from-transparent via-red-400/50 to-transparent",
    badgeClass: "border-red-300 bg-red-50 text-red-800",
    titleClass: "text-zinc-950",
    subtitleClass: "text-zinc-600",
    bulletClass: "border-zinc-200 bg-white/55 hover:border-red-200",
    bulletIconClass: "text-red-600",
    moreClass: "border-red-200 bg-red-50 text-red-800",
    visualPanelClass: "border-zinc-200 bg-white/55 shadow-sm",
    chartPanelClass: "bg-white/70",
    imagePanelClass: "border-zinc-200 bg-white",
    footerClass: "border-zinc-200",
    footerMutedClass: "text-zinc-500",
    chartColors: ["#dc2626", "#18181b", "#d97706", "#2563eb"],
    chartTick: "#71717a",
    chartTooltipBg: "#ffffff",
    chartTooltipBorder: "rgba(113,113,122,0.28)",
    accent: "#dc2626",
    pdf: {
      background: "#fff7ed",
      title: "#18181b",
      subtitle: "#b91c1c",
      body: "#3f3f46",
      muted: "#71717a",
      accent: "#dc2626",
      panel: "#ffffff",
      border: "#d4d4d8",
    },
  },
  {
    id: "midnight",
    name: "Midnight AI",
    description: "Premium technical style for AI, data, and automation products.",
    previewClass: "bg-[linear-gradient(135deg,#020617_0%,#172554_62%,#312e81_130%)]",
    frameClass: "bg-[linear-gradient(135deg,#020617_0%,#172554_62%,#312e81_130%)] text-white",
    edgeClass: "from-transparent via-cyan-300/45 to-transparent",
    badgeClass: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    titleClass: "text-white",
    subtitleClass: "text-blue-100/65",
    bulletClass: "border-cyan-200/10 bg-cyan-100/[0.035] hover:border-cyan-200/25",
    bulletIconClass: "text-cyan-300",
    moreClass: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    visualPanelClass: "border-cyan-100/10 bg-cyan-100/[0.035]",
    chartPanelClass: "bg-slate-950/35",
    imagePanelClass: "border-cyan-100/10 bg-slate-950/40",
    footerClass: "border-cyan-100/10",
    footerMutedClass: "text-blue-100/45",
    chartColors: ["#22d3ee", "#818cf8", "#a78bfa", "#34d399"],
    chartTick: "#93c5fd",
    chartTooltipBg: "#020617",
    chartTooltipBorder: "rgba(34,211,238,0.28)",
    accent: "#22d3ee",
    pdf: {
      background: "#020617",
      title: "#ffffff",
      subtitle: "#67e8f9",
      body: "#dbeafe",
      muted: "#93c5fd",
      accent: "#22d3ee",
      panel: "#0f172a",
      border: "#1d4ed8",
    },
  },
  {
    id: "summit",
    name: "Summit Green",
    description: "Grounded sustainability style with fresh greens and executive calm.",
    previewClass: "bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfeff_58%,#d9f99d_130%)]",
    frameClass: "bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfeff_58%,#d9f99d_130%)] text-emerald-950",
    edgeClass: "from-transparent via-emerald-400/55 to-transparent",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    titleClass: "text-emerald-950",
    subtitleClass: "text-emerald-800/70",
    bulletClass: "border-emerald-200/80 bg-white/65 hover:border-emerald-300",
    bulletIconClass: "text-emerald-600",
    moreClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    visualPanelClass: "border-emerald-200 bg-white/65 shadow-sm",
    chartPanelClass: "bg-emerald-50/70",
    imagePanelClass: "border-emerald-200 bg-white",
    footerClass: "border-emerald-200",
    footerMutedClass: "text-emerald-700/55",
    chartColors: ["#059669", "#65a30d", "#0891b2", "#ca8a04"],
    chartTick: "#047857",
    chartTooltipBg: "#ffffff",
    chartTooltipBorder: "rgba(5,150,105,0.25)",
    accent: "#059669",
    pdf: {
      background: "#f0fdf4",
      title: "#064e3b",
      subtitle: "#047857",
      body: "#065f46",
      muted: "#047857",
      accent: "#059669",
      panel: "#ffffff",
      border: "#a7f3d0",
    },
  },
];

export function getSlideTemplate(templateId?: SlideTemplateId | string) {
  return slideTemplates.find((template) => template.id === templateId) || slideTemplates[0];
}
