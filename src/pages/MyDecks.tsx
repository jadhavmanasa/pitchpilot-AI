import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Eye, Filter, Layout, Plus, Search, Star } from "lucide-react";
import { PitchDeck } from "../types";
import { AnimatePresence, motion } from "motion/react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { getSavedDecks } from "../lib/deckStorage";

function getAverageScore(deck: PitchDeck) {
  const scores = Object.values(deck.investorScore) as number[];
  return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
}

export default function MyDecks() {
  const [decks, setDecks] = useState<PitchDeck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [highScoreOnly, setHighScoreOnly] = useState(false);
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    setDecks(getSavedDecks());
  }, []);

  const filteredDecks = decks
    .filter((deck) => deck.startupName.toLowerCase().includes(searchQuery.toLowerCase()) || deck.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((deck) => !highScoreOnly || getAverageScore(deck) >= 80)
    .sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return newestFirst ? bDate - aDate : aDate - bDate;
    });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Deck library</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-950">Your pitch decks</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Search, filter, and open every generated presentation.</p>
        </div>
        <Link to="/generate" className="glow-btn">
          <Plus className="h-4 w-4" /> Create deck
        </Link>
      </div>

      <div className="panel flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by startup or industry"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:border-teal-300"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHighScoreOnly((value) => !value)}
            className={cn(
              "secondary-btn py-2.5 text-xs",
              highScoreOnly && "border-teal-200 bg-teal-50 text-teal-800"
            )}
          >
            <Filter className="h-4 w-4" /> 80+ score
          </button>
          <button type="button" onClick={() => setNewestFirst((value) => !value)} className="secondary-btn py-2.5 text-xs">
            <Calendar className="h-4 w-4" /> {newestFirst ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: index * 0.04 }}
                className="panel group overflow-hidden"
              >
                <div className="relative bg-slate-950 p-5 text-white">
                  <div className="mb-16 flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                      {deck.industry}
                    </span>
                    <div className="flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-xs font-extrabold text-slate-950">
                      <Star className="h-3 w-3" />
                      {getAverageScore(deck)}
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-extrabold leading-tight">{deck.startupName}</h3>
                  <p className="mt-2 text-xs font-bold text-slate-400">{deck.slides.length} slides</p>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                      {format(new Date(deck.createdAt), "MMM dd, yyyy")}
                    </span>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-teal-800">
                      Ready
                    </span>
                  </div>
                  <Link to={`/viewer/${deck.id}`} className="glow-btn w-full py-2.5">
                    <Eye className="h-4 w-4" /> Open viewer
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="panel flex flex-col items-center p-12 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
            <Layout className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-slate-950">No decks found</h3>
          <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">Adjust your filters or generate a new deck to populate the library.</p>
          <Link to="/generate" className="glow-btn mt-6">Create a deck</Link>
        </div>
      )}
    </div>
  );
}
