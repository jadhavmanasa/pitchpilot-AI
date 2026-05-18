import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BarChart3, Presentation, Target, TrendingUp } from "lucide-react";
import { PitchDeck } from "../types";
import { getSavedDecks } from "../lib/deckStorage";

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((acc, value) => acc + value, 0) / values.length) : 0;
}

export default function Analytics() {
  const [decks, setDecks] = useState<PitchDeck[]>([]);

  useEffect(() => {
    setDecks(getSavedDecks());
  }, []);

  const avgClarity = average(decks.map((deck) => deck.investorScore.clarity));
  const avgMarket = average(decks.map((deck) => deck.investorScore.market));
  const avgInnovation = average(decks.map((deck) => deck.investorScore.innovation));
  const chartData = decks.length
    ? decks.slice(-12).map((deck) => average(Object.values(deck.investorScore) as number[]))
    : [46, 62, 58, 74, 81, 68, 86, 77, 91, 84, 72, 88];

  const stats = [
    { label: "Overall clarity", value: `${avgClarity}%`, icon: Target, tone: "bg-teal-50 text-teal-700" },
    { label: "Total decks", value: decks.length, icon: Presentation, tone: "bg-sky-50 text-sky-700" },
    { label: "Market score", value: `${avgMarket}/100`, icon: BarChart3, tone: "bg-amber-50 text-amber-700" },
    { label: "Innovation", value: `${avgInnovation}/100`, icon: TrendingUp, tone: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-950">Investor readiness trends</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Track the quality signals across your pitch deck library.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-teal-800">
          <span className="h-2 w-2 rounded-full bg-teal-500" /> Live workspace
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="panel p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-extrabold text-emerald-600">+ active</span>
            </div>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-widest text-slate-400">{stat.label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-slate-950">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="panel p-6">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-slate-950">Performance history</h3>
              <p className="text-sm font-semibold text-slate-500">Average deck score for the latest projects.</p>
            </div>
          </div>

          <div className="flex h-72 items-end gap-3">
            {chartData.map((height, index) => (
              <motion.div
                key={`${height}-${index}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.04, duration: 0.8 }}
                className="group relative flex-1 rounded-t-xl bg-gradient-to-t from-teal-600 to-teal-300"
              >
                <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-lg bg-slate-950 px-2 py-1 text-[10px] font-bold text-white group-hover:block">
                  {height}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="font-display text-2xl font-extrabold text-slate-950">Recent activity</h3>
          <div className="mt-6 space-y-5">
            {decks.length ? (
              decks.slice(0, 5).map((deck) => (
                <div key={deck.id} className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-500" />
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{deck.startupName}</p>
                    <p className="text-xs font-semibold text-slate-500">Deck created and scored.</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-500">Create a deck to begin tracking activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
