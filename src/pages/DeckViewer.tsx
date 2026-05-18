import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Layout,
  Loader2,
  Share2,
  Sparkles,
  Star,
  Maximize2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import pptxgen from "pptxgenjs";
import { PitchDeck, SlideTemplateId } from "../types";
import InvestorScoreCard from "../components/deck/InvestorScoreCard";
import SlideRenderer from "../components/deck/SlideRenderer";
import { cn } from "../lib/utils";
import { getSavedDecks, saveDecks } from "../lib/deckStorage";
import { downloadDeckAsPDF } from "../lib/pdfGenerator";
import { getSlideTemplate, slideTemplates } from "../lib/slideTemplates";

export default function DeckViewer() {
  const { id } = useParams();
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const found = getSavedDecks().find((savedDeck) => savedDeck.id === id);
    setDeck(found || null);
  }, [id]);

  if (!deck) {
    return (
      <div className="panel mx-auto max-w-xl p-10 text-center">
        <h2 className="font-display text-2xl font-extrabold text-slate-950">Deck not found</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">This deck may belong to a different local account.</p>
        <Link to="/dashboard" className="glow-btn mt-6">Back to dashboard</Link>
      </div>
    );
  }

  const score = Math.round(Object.values(deck.investorScore).reduce((a, b) => a + b, 0) / 5);
  const currentSlide = deck.slides[currentSlideIndex];
  const nextSlide = () => setCurrentSlideIndex((prev) => Math.min(prev + 1, deck.slides.length - 1));
  const prevSlide = () => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));

  const updateDeckTemplate = (templateId: SlideTemplateId) => {
    const updatedDeck = { ...deck, templateId };
    setDeck(updatedDeck);
    saveDecks(getSavedDecks().map((savedDeck) => (savedDeck.id === deck.id ? updatedDeck : savedDeck)));
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      await downloadDeckAsPDF(deck);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportPPTX = () => {
    try {
      const template = getSlideTemplate(deck.templateId);
      const pptColor = (color: string) => color.replace("#", "").toUpperCase();
      const pres = new pptxgen();
      pres.layout = "LAYOUT_WIDE";
      deck.slides.forEach((slideData) => {
        const slide = pres.addSlide();
        slide.background = { color: pptColor(template.pdf.background) };
        slide.addShape(pptxgen.ShapeType.rect, {
          x: 0.45,
          y: 0.28,
          w: 1.35,
          h: 0.08,
          fill: { color: pptColor(template.pdf.accent) },
          line: { color: pptColor(template.pdf.accent), transparency: 100 },
        });
        slide.addText(slideData.type.toUpperCase(), { x: 0.5, y: 0.47, fontSize: 8, bold: true, color: pptColor(template.pdf.accent) });
        slide.addText(slideData.title, { x: 0.5, y: 0.72, w: 7.3, h: 0.75, fontSize: 30, bold: true, color: pptColor(template.pdf.title), breakLine: false });
        slide.addText(slideData.subtitle, { x: 0.5, y: 1.48, w: 7.2, h: 0.42, fontSize: 14, color: pptColor(template.pdf.subtitle), breakLine: false });
        slide.addShape(pptxgen.ShapeType.rect, {
          x: 0.5,
          y: 2.08,
          w: 7.25,
          h: 4.38,
          fill: { color: pptColor(template.pdf.panel), transparency: 8 },
          line: { color: pptColor(template.pdf.border), transparency: 15 },
        });
        slideData.content.slice(0, 6).forEach((line, index) => {
          slide.addText(`- ${line}`, { x: 0.78, y: 2.35 + index * 0.58, w: 6.7, h: 0.4, fontSize: 10.5, color: pptColor(template.pdf.body), breakLine: false, fit: "shrink" });
        });
        slide.addText("Built with PitchPilot AI", { x: 0.5, y: 7.05, fontSize: 7.5, bold: true, color: pptColor(template.pdf.muted) });
        slide.addText(template.name, { x: 10.6, y: 7.05, w: 2.2, h: 0.2, fontSize: 7.5, bold: true, color: pptColor(template.pdf.muted), align: "right" });
      });
      pres.writeFile({ fileName: `${deck.startupName}-pitch.pptx` });
    } catch (err) {
      console.error("PPTX export failed", err);
      alert("Failed to generate PPTX. Please try again.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Pitch Deck: ${deck.startupName}`,
      text: `Check out this AI-generated pitch deck for ${deck.startupName}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard.");
    }
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      alert("Deck optimized. PitchPilot tightened the wording and slide flow.");
    }, 1400);
  };

  const viewerStage = (
    <div className={cn("mx-auto w-full", isFocusMode ? "max-w-[min(96vw,1500px)]" : "max-w-6xl")}>
      <div className="group relative">
        <div
          className={cn(
            "relative mx-auto aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/15"
          )}
          style={{
            width: isFocusMode
              ? "min(96vw, max(320px, calc((100vh - 150px) * 16 / 9)), 1500px)"
              : "min(100%, max(320px, calc((100vh - 350px) * 16 / 9)), 1152px)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="h-full"
            >
              <SlideRenderer slide={currentSlide} slideNumber={currentSlideIndex + 1} totalSlides={deck.slides.length} templateId={deck.templateId} />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          title="Previous slide"
          className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-lg transition-all hover:bg-teal-50 disabled:pointer-events-none disabled:opacity-30 md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          disabled={currentSlideIndex === deck.slides.length - 1}
          title="Next slide"
          className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-lg transition-all hover:bg-teal-50 disabled:pointer-events-none disabled:opacity-30 md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          className="secondary-btn min-w-36 py-2.5 text-xs disabled:pointer-events-none disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center justify-center gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-600">
            Slide {currentSlideIndex + 1} of {deck.slides.length}
          </span>
          <button
            type="button"
            onClick={() => setIsFocusMode((value) => !value)}
            className="icon-btn"
            title={isFocusMode ? "Exit focus mode" : "Focus mode"}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={nextSlide}
          disabled={currentSlideIndex === deck.slides.length - 1}
          className="glow-btn min-w-36 py-2.5 text-xs disabled:pointer-events-none disabled:opacity-45"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-[100] overflow-auto bg-slate-950/95 p-4 text-white md:p-6">
        <div className="mx-auto mb-4 flex max-w-[min(96vw,1500px)] items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-300">Focus mode</p>
            <h2 className="font-display text-xl font-extrabold">{deck.startupName}</h2>
          </div>
          <button type="button" onClick={() => setIsFocusMode(false)} className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-slate-950">
            Exit
          </button>
        </div>
        {viewerStage}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-5 pb-6">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm md:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <Link to="/dashboard" className="mb-2 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
              <h1 className="truncate font-display text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{deck.startupName}</h1>
              <span className="mb-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-teal-800">{deck.industry}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={deck.templateId || "aurora"}
              onChange={(event) => updateDeckTemplate(event.target.value as SlideTemplateId)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm transition-all hover:border-teal-200"
              title="Slide template"
            >
              {slideTemplates.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            <button onClick={exportPDF} disabled={isExporting} className="secondary-btn py-2.5 text-xs">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              PDF
            </button>
            <button onClick={exportPPTX} className="secondary-btn py-2.5 text-xs">
              <FileDown className="h-4 w-4" /> PPTX
            </button>
            <button onClick={handleShare} className="glow-btn py-2.5 text-xs">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white/55 p-3 md:p-5">
            {viewerStage}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/85 p-3 shadow-sm">
            <div className="scrollbar-hide flex max-w-full gap-3 overflow-x-auto pb-1">
              {deck.slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => setCurrentSlideIndex(index)}
                  className={cn(
                    "h-20 w-40 shrink-0 rounded-2xl border bg-white p-3 text-left transition-all md:w-44",
                    currentSlideIndex === index ? "border-teal-300 shadow-md shadow-teal-900/10 ring-2 ring-teal-100" : "border-slate-200 opacity-75 hover:opacity-100"
                  )}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Slide {index + 1}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-extrabold leading-4 text-slate-800">{slide.title}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="min-w-0 space-y-4 xl:max-h-[calc(100vh-190px)] xl:overflow-y-auto xl:pr-1">
        <div className="panel p-5">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Investor score</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Readiness estimate</p>
            </div>
            <p className="font-mono text-4xl font-bold text-teal-700">{score}</p>
          </div>
          <InvestorScoreCard score={deck.investorScore} />
        </div>

        <div className="panel p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
            <Star className="h-4 w-4 text-amber-500" /> Speaker script
          </div>
          <p className="text-sm font-medium leading-6 text-slate-700">{currentSlide.speakerScript}</p>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
            <Users className="h-4 w-4 text-teal-700" /> Target investors
          </div>
          <div className="flex flex-wrap gap-2">
            {deck.targetInvestors?.map((investor) => (
              <span key={investor} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{investor}</span>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
            <Layout className="h-4 w-4 text-teal-700" /> AI suggestions
          </div>
          <div className="space-y-3 text-sm font-medium leading-6 text-slate-600">
            <p>Add one customer proof point to make the traction slide stronger.</p>
            <p>Use the speaker script to keep each slide under one minute.</p>
          </div>
          <button onClick={handleOptimize} disabled={isOptimizing} className="secondary-btn mt-5 w-full py-2.5">
            {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Improve deck
          </button>
        </div>
      </aside>
    </div>
    </div>
  );
}
