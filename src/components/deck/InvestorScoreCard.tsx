import { InvestorScore } from "../../types";
import { motion } from "motion/react";

export default function InvestorScoreCard({ score }: { score: InvestorScore }) {
  const metrics = [
    { label: "Story Clarity", value: score.clarity, color: "bg-teal-500" },
    { label: "Market Scale", value: score.market, color: "bg-sky-500" },
    { label: "Innovation", value: score.innovation, color: "bg-rose-500" },
    { label: "Scalability", value: score.scalability, color: "bg-emerald-500" },
    { label: "Potential ROI", value: score.revenue, color: "bg-amber-500" },
  ];

  const totalScore = Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              className="text-teal-500"
              initial={{ strokeDasharray: "0, 376.8" }}
              animate={{ strokeDasharray: `${(totalScore / 100) * 376.8}, 376.8` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black font-display text-slate-950">{totalScore}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">{m.label}</span>
              <span className="text-slate-900">{m.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${m.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${m.value}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100">
         <p className="text-[11px] text-slate-500 italic leading-relaxed text-center">
            This score represents the AI estimate of your deck competitiveness in a typical Seed-stage VC pipeline.
         </p>
      </div>
    </div>
  );
}
