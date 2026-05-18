import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/utils";
import { saveDeck } from "../lib/deckStorage";
import { PitchDeck, SlideTemplateId } from "../types";
import SlideRenderer from "../components/deck/SlideRenderer";
import { resolveDeckImages } from "../lib/slideImages";
import { slideTemplates } from "../lib/slideTemplates";

const industries = ["SaaS", "Fintech", "Healthtech", "AI/ML", "Consumer", "B2B Enterprise", "Marketplace", "Web3/Crypto"];
const stages = ["Pre-seed", "Seed", "Series A", "Series B"];

const loadingSteps = [
  "Analyzing your startup idea",
  "Mapping the investor story",
  "Structuring slides and talking points",
  "Estimating market and revenue signals",
  "Scoring readiness and polishing the deck",
];

const stageNotes: Record<string, string> = {
  "Pre-seed": "Idea stage - searching for fit",
  Seed: "MVP or traction - building core team",
  "Series A": "Growth - scaling established revenue",
  "Series B": "Scale - market expansion",
};

export default function GenerateDeck() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<PitchDeck | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showScript, setShowScript] = useState(true);
  const [generationError, setGenerationError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [generationPhase, setGenerationPhase] = useState<"deck" | "images">("deck");
  const [formData, setFormData] = useState<{
    idea: string;
    industry: string;
    audience: string;
    stage: string;
    templateId: SlideTemplateId;
  }>({
    idea: "",
    industry: "SaaS",
    audience: "",
    stage: "Seed",
    templateId: "aurora",
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setGenerationPhase("deck");
    setGenerationError("");

    try {
      const response = await fetch("/api/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to generate the deck.");
      }

      const data = await response.json();
      const newDeck: PitchDeck = {
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        ...data,
        templateId: formData.templateId,
      };
      setGenerationPhase("images");
      const deckWithImages = await resolveDeckImages(newDeck);

      saveDeck(deckWithImages);
      setCurrentSlideIndex(0);
      setGeneratedDeck(deckWithImages);
    } catch (error) {
      console.error(error);
      setGenerationError(
        error instanceof TypeError && error.message === "Failed to fetch"
          ? "Backend server is not running. Start the app server and try again."
          : error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
      );
    } finally {
      setIsGenerating(false);
      setGenerationPhase("deck");
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      (window as any).recognition?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setFormData((prev) => ({ ...prev, idea: `${prev.idea} ${text}`.trim() }));
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    (window as any).recognition = recognition;
    setIsListening(true);
  };

  const nextSlide = () => generatedDeck && setCurrentSlideIndex((prev) => Math.min(prev + 1, generatedDeck.slides.length - 1));
  const prevSlide = () => generatedDeck && setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));

  if (generatedDeck) {
    const score = Math.round(Object.values(generatedDeck.investorScore).reduce((a, b) => a + b, 0) / 5);
    const currentSlide = generatedDeck.slides[currentSlideIndex];

    return (
      <div className="mx-auto max-w-7xl space-y-6 pb-20">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Generated deck</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-950">{generatedDeck.startupName}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {generatedDeck.industry} deck with {generatedDeck.slides.length} slides and a {score}/100 investor score.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowScript((value) => !value)} className="secondary-btn py-2.5">
              {showScript ? "Hide script" : "Show script"}
            </button>
            <button type="button" onClick={() => setGeneratedDeck(null)} className="secondary-btn py-2.5">
              <ArrowLeft className="h-4 w-4" /> New pitch
            </button>
            <button type="button" onClick={() => navigate(`/viewer/${generatedDeck.id}`)} className="glow-btn py-2.5">
              Open full viewer
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="group relative">
              <div
                className="relative mx-auto aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/15"
                style={{ width: "min(100%, max(320px, calc((100vh - 360px) * 16 / 9)), 1024px)" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlideIndex}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    className="h-full"
                  >
                    <SlideRenderer slide={currentSlide} slideNumber={currentSlideIndex + 1} totalSlides={generatedDeck.slides.length} templateId={generatedDeck.templateId} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <button type="button" onClick={prevSlide} disabled={currentSlideIndex === 0} className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-white/90 text-slate-900 shadow-lg disabled:hidden">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={nextSlide} disabled={currentSlideIndex === generatedDeck.slides.length - 1} className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-white/90 text-slate-900 shadow-lg disabled:hidden">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
              {generatedDeck.slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => setCurrentSlideIndex(index)}
                  className={cn(
                    "w-40 shrink-0 rounded-2xl border bg-white p-3 text-left transition-all",
                    currentSlideIndex === index ? "border-teal-300 shadow-md" : "border-slate-200 opacity-70 hover:opacity-100"
                  )}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Slide {index + 1}</p>
                  <p className="mt-1 truncate text-xs font-extrabold text-slate-800">{slide.title}</p>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Investor score</p>
                <p className="font-mono text-3xl font-bold text-teal-700">{score}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${score}%` }} />
              </div>
            </div>

            <AnimatePresence>
              {showScript && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="panel p-5">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">Speaker script</p>
                  <p className="text-sm font-medium leading-6 text-slate-700">{currentSlide.speakerScript}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                <Users className="h-4 w-4 text-teal-700" /> Target investors
              </div>
              <div className="flex flex-wrap gap-2">
                {generatedDeck.targetInvestors.map((investor) => (
                  <span key={investor} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                    {investor}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 pb-20 lg:grid-cols-[0.78fr_1.22fr]">
      <section className="space-y-6">
        <div>
          <p className="eyebrow">AI generator</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Start with the story.</h1>
          <p className="mt-4 text-base font-medium leading-7 text-slate-600">
            Describe the startup, choose the market, and tell PitchPilot who the deck needs to persuade.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-300">What you get</p>
          <div className="mt-6 space-y-4">
            {["10-slide pitch structure", "Charts, visuals, and investor score", "Presenter script for every slide", "PDF and PPTX export path"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                <Sparkles className="h-4 w-4 text-amber-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="generating" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="panel flex min-h-[560px] flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                <Loader2 className="absolute h-20 w-20 animate-spin opacity-20" />
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="font-display text-3xl font-extrabold text-slate-950">
                {generationPhase === "images" ? "Generating slide images" : loadingSteps[loadingStep]}
              </h2>
              <div className="mt-8 w-full max-w-md">
                <div className="mb-2 flex justify-between text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  <span>Generating</span>
                  <span>{Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div className="h-full rounded-full bg-teal-500" animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleGenerate} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel space-y-6 p-6 md:p-8">
              <div className="space-y-3">
                <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-slate-500">
                  Startup idea
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold transition-all",
                      isListening ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-500 hover:text-teal-700"
                    )}
                  >
                    {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    {isListening ? "Listening" : "Voice"}
                  </button>
                </label>
                <textarea
                  required
                  rows={7}
                  placeholder="Example: We help small clinics automate patient follow-ups with AI voice agents, reducing missed appointments and improving retention."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium leading-6 text-slate-800 transition-all placeholder:text-slate-400 focus:border-teal-300"
                  value={formData.idea}
                  onChange={(event) => setFormData((prev) => ({ ...prev, idea: event.target.value }))}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Industry</label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 focus:border-teal-300"
                    value={formData.industry}
                    onChange={(event) => setFormData((prev) => ({ ...prev, industry: event.target.value }))}
                  >
                    {industries.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Business stage</label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 focus:border-teal-300"
                    value={formData.stage}
                    onChange={(event) => setFormData((prev) => ({ ...prev, stage: event.target.value }))}
                  >
                    {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                  </select>
                  <p className="text-xs font-bold text-slate-400">{stageNotes[formData.stage]}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Target investors</label>
                <input
                  required
                  type="text"
                  placeholder="Early-stage VC firms, angel investors, healthcare accelerators"
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 transition-all placeholder:text-slate-400 focus:border-teal-300"
                  value={formData.audience}
                  onChange={(event) => setFormData((prev) => ({ ...prev, audience: event.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Slide template</label>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {slideTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, templateId: template.id }))}
                      className={cn(
                        "group rounded-2xl border bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                        formData.templateId === template.id ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200"
                      )}
                    >
                      <div className={cn("mb-3 aspect-video overflow-hidden rounded-xl border border-black/5 p-2", template.previewClass)}>
                        <div className="h-2 w-12 rounded-full bg-white/80" />
                        <div className="mt-5 h-2.5 w-3/4 rounded-full bg-white/80" />
                        <div className="mt-2 h-1.5 w-1/2 rounded-full bg-white/60" />
                        <div className="mt-5 grid grid-cols-3 gap-1.5">
                          {template.chartColors.slice(0, 3).map((color) => (
                            <span key={color} className="h-7 rounded-md" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{template.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{template.description}</p>
                        </div>
                        <span
                          className={cn(
                            "mt-1 h-3 w-3 shrink-0 rounded-full border",
                            formData.templateId === template.id ? "border-teal-700 bg-teal-500" : "border-slate-300 bg-white"
                          )}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700">
                    <Info className="h-4 w-4" />
                  </div>
                  The generator uses your server endpoint and saves successful decks locally.
                </div>
                <button type="submit" disabled={!formData.idea || !formData.audience} className="glow-btn">
                  Create deck <Send className="h-4 w-4" />
                </button>
              </div>

              {generationError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {generationError}
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
