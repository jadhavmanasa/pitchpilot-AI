import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, PlusCircle, Presentation, Star, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { PitchDeck } from "../types";
import { getSavedDecks } from "../lib/deckStorage";

function getAverageScore(deck: PitchDeck) {
  const scores = Object.values(deck.investorScore) as number[];
  return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
}

export default function Dashboard() {
  const [decks, setDecks] = useState<PitchDeck[]>([]);

  useEffect(() => {
    setDecks(getSavedDecks());
  }, []);

  const avgScore = decks.length ? Math.round(decks.reduce((acc, deck) => acc + getAverageScore(deck), 0) / decks.length) : 0;
  const topScore = decks.length ? Math.max(...decks.map(getAverageScore)) : 0;
  const totalSlides = decks.reduce((acc, deck) => acc + deck.slides.length, 0);

  const stats = [
    { label: "Decks", value: decks.length, icon: Presentation, color: "bg-teal-50 text-teal-700" },
    { label: "Average score", value: avgScore, suffix: "/100", icon: Star, color: "bg-amber-50 text-amber-700" },
    { label: "Top score", value: topScore, suffix: "/100", icon: TrendingUp, color: "bg-rose-50 text-rose-700" },
    { label: "Slides created", value: totalSlides, icon: Clock, color: "bg-sky-50 text-sky-700" },
  ];

  return (
    <div className="space-y-8 pb-20">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15 md:p-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-300">Pitch workspace</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Build, score, and export your decks.</h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300">
              Start with a brief, generate an investor-ready deck, then review scripts and scores before exporting.
            </p>
          </div>
          <Link to="/generate" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-teal-100">
            <PlusCircle className="h-4 w-4" />
            Create deck
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="panel p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{stat.label}</p>
            </div>
            <div className="mt-6 flex items-end gap-1">
              <p className="font-display text-4xl font-extrabold text-slate-950">{stat.value}</p>
              {stat.suffix && <span className="pb-1 text-sm font-extrabold text-slate-400">{stat.suffix}</span>}
            </div>
          </motion.div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Recent projects</p>
            <h3 className="mt-1 font-display text-2xl font-extrabold text-slate-950">Your latest decks</h3>
          </div>
          <Link to="/my-decks" className="hidden items-center gap-2 text-sm font-extrabold text-teal-700 hover:text-teal-900 sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {decks.length === 0 ? (
          <div className="panel flex flex-col items-center p-10 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
              <Presentation className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-slate-950">No decks yet</h3>
            <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">Create your first deck to unlock the viewer, analytics, and export screens.</p>
            <Link to="/generate" className="glow-btn mt-6">Create first deck</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {decks.slice(0, 6).map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="panel overflow-hidden"
              >
                <div className="bg-slate-950 p-5 text-white">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                      {deck.industry}
                    </span>
                    <span className="font-mono text-sm font-bold text-teal-300">{getAverageScore(deck)}/100</span>
                  </div>
                  <h4 className="font-display text-2xl font-extrabold leading-tight">{deck.startupName}</h4>
                  <p className="mt-2 text-xs font-semibold text-slate-400">{deck.slides.length} slides ready</p>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock className="h-4 w-4" />
                    {format(new Date(deck.createdAt), "MMM d, yyyy")}
                  </div>
                  <Link to={`/viewer/${deck.id}`} className="rounded-xl bg-teal-50 px-4 py-2 text-xs font-extrabold text-teal-800 transition-colors hover:bg-teal-100">
                    Open
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
