import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Download, FileText, Loader2, Search, Share2 } from "lucide-react";
import { PitchDeck } from "../types";
import { format } from "date-fns";
import { downloadDeckAsPDF } from "../lib/pdfGenerator";
import { getSavedDecks } from "../lib/deckStorage";

export default function Exports() {
  const [decks, setDecks] = useState<PitchDeck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDecks(getSavedDecks());
  }, []);

  const handleDownload = async (deck: PitchDeck) => {
    setExportingId(deck.id);
    setMessage("");
    try {
      await downloadDeckAsPDF(deck);
      setMessage(`${deck.startupName} exported as PDF.`);
    } catch (err) {
      console.error(err);
      setMessage("Download failed. Please try again.");
    } finally {
      setExportingId(null);
    }
  };

  const handleShare = async (deck: PitchDeck) => {
    setMessage("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Pitch deck: ${deck.startupName}`,
          text: `Check out my generated pitch deck for ${deck.startupName}.`,
          url: `${window.location.origin}/viewer/${deck.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/viewer/${deck.id}`);
        setMessage("Deck link copied to clipboard.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Sharing was cancelled or failed.");
    }
  };

  const filteredDecks = decks.filter((deck) => deck.startupName.toLowerCase().includes(searchQuery.toLowerCase()) || deck.industry.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Exports</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-950">Download center</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Find decks, export PDFs, and copy share links.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exports"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:border-teal-300"
          />
        </div>
      </div>

      {message && <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800">{message}</div>}

      <div className="panel overflow-hidden p-0">
        {filteredDecks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Deck", "Industry", "Format", "Slides", "Date", "Status", "Actions"].map((heading) => (
                    <th key={heading} className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDecks.map((deck, index) => (
                  <motion.tr key={deck.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-extrabold text-slate-900">{deck.startupName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{deck.industry}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">PDF</span></td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{deck.slides.length} slides</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{format(new Date(deck.createdAt), "MMM dd, yyyy")}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">Ready</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDownload(deck)} disabled={exportingId === deck.id} className="icon-btn">
                          {exportingId === deck.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => handleShare(deck)} className="icon-btn">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h3 className="font-display text-2xl font-extrabold text-slate-950">No exportable decks</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">Generate a deck first, then it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
