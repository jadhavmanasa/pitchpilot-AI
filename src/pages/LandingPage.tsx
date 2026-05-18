import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  LineChart,
  Play,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getSavedDecks, saveDecks } from "../lib/deckStorage";

const features = [
  { icon: Sparkles, title: "Guided deck creation", description: "Capture the idea, audience, stage, and industry in one focused brief." },
  { icon: LineChart, title: "Investor scoring", description: "Review clarity, market, innovation, scalability, and revenue readiness." },
  { icon: FileText, title: "Speaker scripts", description: "Each slide includes talking points so the deck is presentation-ready." },
  { icon: Download, title: "PDF and PPTX exports", description: "Download polished pitch assets from the viewer and export center." },
];

const metrics = [
  { label: "Clarity", value: 92 },
  { label: "Market", value: 88 },
  { label: "Revenue", value: 81 },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const createSampleDeck = () => {
    const sample = {
      id: "sample-123",
      createdAt: new Date().toISOString(),
      startupName: "Veridian AI",
      industry: "Supply Chain",
      investorScore: { clarity: 92, market: 88, innovation: 95, scalability: 84, revenue: 81 },
      slides: [
        {
          type: "cover",
          title: "Veridian AI",
          subtitle: "Autonomous logistics for the next billion shipments",
          content: ["Real-time routing intelligence", "Predictive fleet orchestration", "Lower missed delivery costs"],
          imagePrompt: "professional logistics command center with teal dashboard screens",
          speakerScript: "Veridian AI gives logistics teams a live operating system for routing, capacity, and delivery reliability.",
        },
        {
          type: "problem",
          title: "Supply Chains Are Flying Blind",
          subtitle: "$40B in annual logistics losses from fragmented visibility",
          content: ["Fragmented carrier data", "Slow capacity decisions", "Manual exception handling"],
          imagePrompt: "urban logistics dashboard with delivery network maps",
          speakerScript: "The problem is not a lack of data. It is that operators cannot act on the data quickly enough.",
        },
      ],
      competitors: [],
      targetInvestors: ["Seed VC firms", "Angel investors", "Logistics accelerators"],
    };

    const saved = getSavedDecks();
    if (!saved.find((deck) => deck.id === sample.id)) {
      saveDecks([sample as any, ...saved]);
    }
  };

  return (
    <div className="app-bg min-h-screen text-slate-950">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold tracking-tight">PitchPilot</p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-700">AI pitch workspace</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-950">Features</a>
            <a href="#workflow" className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-950">Workflow</a>
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-950">
              {isAuthenticated ? "Dashboard" : "Log in"}
            </Link>
            <Link to={isAuthenticated ? "/generate" : "/signup"} className="glow-btn py-2.5">
              Start building <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-14 md:grid-cols-[0.92fr_1.08fr] md:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-800">
              <Sparkles className="h-4 w-4" />
              AI deck studio
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-slate-950 md:text-7xl">
              PitchPilot
              <span className="block gradient-text">builds the deck.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-slate-600">
              A polished startup pitch workspace for generating slides, reviewing investor scores, rehearsing scripts, and exporting a real deck.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={isAuthenticated ? "/generate" : "/signup"} className="glow-btn">
                Generate a deck <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                onClick={isAuthenticated ? createSampleDeck : undefined}
                className="secondary-btn"
              >
                <Play className="h-4 w-4" />
                View demo workspace
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["10+", "Deck slides"],
                ["5", "Score areas"],
                ["2", "Export formats"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="font-display text-2xl font-extrabold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="relative"
          >
            <div className="panel overflow-hidden p-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-2xl shadow-slate-950/20">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-teal-400" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                    Investor view
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-300">Slide 01 / Cover</p>
                    <h2 className="font-display text-4xl font-extrabold leading-tight">Autonomous logistics for modern teams</h2>
                    <p className="mt-4 max-w-md text-sm font-medium leading-6 text-slate-400">
                      Turn raw founder notes into a boardroom-ready story with visual slides and presenter guidance.
                    </p>
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      {metrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl bg-white/[0.05] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{metric.label}</p>
                          <p className="mt-2 font-mono text-2xl font-bold text-white">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-4 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-amber-200">
                        <BarChart3 className="h-4 w-4" />
                        Readiness
                      </div>
                      <div className="space-y-3">
                        {metrics.map((metric) => (
                          <div key={metric.label}>
                            <div className="mb-1 flex justify-between text-xs font-bold text-slate-300">
                              <span>{metric.label}</span>
                              <span>{metric.value}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-teal-400" style={{ width: `${metric.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-teal-300">
                        <Users className="h-4 w-4" />
                        Target investors
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Seed VC", "Angels", "Accelerators"].map((tag) => (
                          <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-slate-200">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="features" className="border-t border-slate-200/80 bg-white/65 py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="eyebrow">Everything connected</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-950">A full deck workflow, not just a text box.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="panel p-6"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">From idea to investor-ready deck.</h2>
              <p className="mt-4 text-base font-medium leading-7 text-slate-600">
                The UI now gives founders a clean workspace for briefing the AI, previewing slides, checking investor readiness, and exporting files.
              </p>
            </div>
            <div className="panel p-6">
              {["Write the startup brief", "Generate slides and scripts", "Review scores and target investors", "Export PDF or PPTX"].map((step, index) => (
                <div key={step} className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 font-mono text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{step}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 text-sm font-bold text-slate-500 md:flex-row md:items-center md:px-8">
          <span>PitchPilot AI</span>
          <span>Built for fast startup storytelling.</span>
          <div className="flex gap-5">
            <Shield className="h-5 w-5 text-teal-700" />
            <span>Local demo accounts and decks</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
