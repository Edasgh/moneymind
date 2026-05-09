"use client";

import { motion } from "framer-motion";

export default function LifeImpactCard({
  metrics,
}: {
  metrics: {
    financialStabilityScore: number;
    survivalMonths: number;
    stressRisk: "low" | "medium" | "high";
  };
}) {
  if (!metrics) return null;

  const getColor = (value: number) => {
    if (value > 70) return "text-green-400";
    if (value > 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getStressColor = () => {
    if (metrics.stressRisk === "low") return "text-green-400";
    if (metrics.stressRisk === "medium") return "text-yellow-400";
    return "text-red-400";
  };

  const getInsight = () => {
    if (metrics.financialStabilityScore > 70)
      return "You're in a strong financial position";
    if (metrics.financialStabilityScore > 40)
      return "You're stable but can improve savings";
    return "Your finances need attention";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        w-full
        p-4 sm:p-5
        rounded-2xl
        bg-white/5
        border border-white/10
        backdrop-blur-xl
        space-y-4
      "
    >
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">🧠 Life Impact</p>
        <p className="text-[11px] text-gray-500 leading-tight">
          {getInsight()}
        </p>
      </div>

      {/* STABILITY */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Financial Stability</span>
          <span
            className={`font-semibold ${getColor(
              metrics.financialStabilityScore,
            )}`}
          >
            {metrics.financialStabilityScore}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.financialStabilityScore}%` }}
            transition={{ duration: 0.6 }}
            className="h-2 bg-linear-to-r from-blue-500 to-green-400"
          />
        </div>
      </div>

      {/* GRID */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          gap-3 sm:gap-4
        "
      >
        {/* Survival */}
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Survival Time</p>

          <p className="text-lg font-semibold text-blue-400">
            {metrics.survivalMonths?.toFixed(1)}
          </p>

          <p className="text-[11px] text-gray-500">months without income</p>
        </div>

        {/* Stress */}
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Stress Risk</p>

          <p className={`text-lg font-semibold ${getStressColor()}`}>
            {metrics.stressRisk}
          </p>

          <p className="text-[11px] text-gray-500">based on savings buffer</p>
        </div>
      </div>

      {/* FOOTER INSIGHT */}
      <div
        className="
          text-[11px] text-gray-400
          bg-white/5
          p-3
          rounded-xl
          border border-white/10
          leading-relaxed
        "
      >
        {metrics.survivalMonths < 3
          ? "⚠️ You have low financial backup. Build an emergency fund."
          : metrics.survivalMonths < 6
            ? "⚡ You're moderately safe. Aim for 6 months backup."
            : "✅ You have a strong emergency buffer."}
      </div>
    </motion.div>
  );
}
