import { motion } from "framer-motion";
import { GlassCard } from "@/app/analyze/page";
import { toast } from "react-toastify";
import ScoreMeter from "./ScoreMeter";

const AIAnalysis = ({
  transactionsLength,
  income,
  setShowUpload,
  setShowAddModal,
  totalIncome,
  totalSpent,
  latestAnalysis,
  downloadResult,
  currency_str,
}: {
  transactionsLength: number;
  income: string;
  setShowUpload: any;
  setShowAddModal: any;
  totalIncome: string;
  totalSpent: string;
  latestAnalysis: any;
  downloadResult: any;
  currency_str: string;
}) => {
  currency_str = currency_str ?? "₹";

  return (
    <div>
      {/* 🧠 AI ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard gradient>
          <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-white">
                🧠 AI Financial Insights
              </p>

              <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                AI Powered
              </span>
            </div>

            {/* EMPTY STATE */}
            {transactionsLength < 15 ? (
              <div className="p-5 rounded-xl bg-linear-to-br from-purple-500/10 to-blue-500/10 border border-white/10 space-y-4">
                {/* ICON + TITLE */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🧠</div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      AI Insights Locked
                    </p>
                    <p className="text-xs text-gray-400">
                      Not enough data to generate meaningful analysis
                    </p>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Data Progress</span>
                    <span>{transactionsLength}/15</span>
                  </div>

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all"
                      style={{
                        width: `${Math.min(
                          (transactionsLength / 15) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* WHY THIS MATTERS */}
                <div className="text-[11px] text-gray-400 leading-relaxed">
                  AI needs enough transactions to detect spending patterns,
                  habits, and risks accurately.
                </div>

                {/* CTA */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (Number(income) <= 0) {
                        toast.error("Enter your monthly income amount first");
                      } else {
                        setShowUpload(true);
                      }
                    }}
                    className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Upload Statement
                  </button>

                  <button
                    onClick={() => {
                      if (Number(income) <= 0) {
                        toast.error("Enter your monthly income amount first");
                      } else {
                        setShowAddModal(true);
                      }
                    }}
                    className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  >
                    Add Transactions
                  </button>
                </div>

                {/* HINT */}
                <p className="text-[10px] text-gray-500">
                  Tip: Upload 1–2 months of data for best insights
                </p>
              </div>
            ) : (
              <>
                {/* 💸 SUMMARY */}
                <div className="flex flex-wrap h-fit md:h-28 justify-start w-full items-start gap-4">
                  <div className="p-3 flex-1 w-full h-full sm:p-4 rounded-xl bg-linear-to-br from-red-500/10 to-transparent border border-red-500/20 backdrop-blur">
                    <p className="text-xs text-gray-400">💸 Total Spent</p>
                    <p className="text-lg font-semibold text-red-400">
                      {currency_str}
                      {Number(totalSpent).toFixed(2)}
                    </p>
                  </div>

                  <div className="p-3 flex-1 w-full h-full sm:p-4 rounded-xl bg-linear-to-br from-green-500/10 to-transparent border border-green-500/20 backdrop-blur">
                    <p className="text-xs text-gray-400">💰 Total Income</p>
                    <p className="text-lg font-semibold text-green-400">
                      {currency_str}
                      {Number(totalIncome).toFixed(2)}
                    </p>
                  </div>
                  {/* 📊 IMPACT */}
                  {latestAnalysis?.impact && (
                    <div className="hidden md:block relative h-full flex-1 w-full p-4 rounded-xl border border-green-500/20">
                      <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent" />

                      <div className="relative">
                        <p className="text-xs text-gray-400">
                          📈 Potential Monthly Savings
                        </p>

                        <p className="text-lg font-semibold text-green-400">
                          {currency_str}
                          {latestAnalysis.impact.savingsPotential}
                          /month
                        </p>

                        <p className="text-[10px] text-gray-500">
                          ≈ {currency_str}
                          {latestAnalysis.impact.projectedSavings} in 3 months
                        </p>

                        <p className="text-[10px] text-gray-500 mt-1">
                          Small optimizations → big long-term impact 🚀
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* MAIN ANALYSIS */}
                {latestAnalysis ? (
                  <motion.div
                    key={latestAnalysis.createdAt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* 🎯 SCORE HERO */}
                    <ScoreMeter
                      score={latestAnalysis.score}
                      personality={latestAnalysis.personality}
                    />

                    {/* 💡 INSIGHTS &  ⚡ ACTION PLAN */}
                    <div className="flex flex-col md:flex-row w-full gap-4 justify-start items-start">
                      {/* 💡 INSIGHTS */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-2">
                          💡 Key Insights
                        </p>

                        <div className="space-y-2">
                          {latestAnalysis.insights
                            ?.slice(0, 3)
                            .map((ins: any, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-2 sm:p-3 rounded-lg 
                  bg-linear-to-r from-white/5 to-white/0 
                  border border-white/10 
                  text-xs sm:text-sm text-gray-300 
                  hover:border-purple-400/30 transition"
                              >
                                <span className="mr-3">📊</span>
                                {ins.text}
                              </motion.div>
                            ))}
                        </div>
                      </div>

                      {/* ⚡ ACTION PLAN */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-2">
                          ⚡ Action Plan
                        </p>

                        <div className="space-y-2">
                          {latestAnalysis.fixes
                            ?.slice(0, 3)
                            .map((fix: any, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-2 p-2 sm:p-3 rounded-lg 
                  bg-linear-to-r from-blue-500/10 to-transparent 
                  border border-blue-500/20 
                  text-xs sm:text-sm 
                  hover:border-blue-400/40 transition"
                              >
                                <span className="text-base">
                                  {fix.priority === "high"
                                    ? "🔴"
                                    : fix.priority === "medium"
                                      ? "🟡"
                                      : "🟢"}
                                </span>

                                <p className="text-gray-300 leading-snug">
                                  {fix.action}
                                </p>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-xs text-gray-500">
                    🤖 AI analysis will appear after processing
                  </p>
                )}

                {/* 📊 IMPACT */}
                {latestAnalysis?.impact && (
                  <div className="block md:hidden relative flex-1 p-4 rounded-xl border border-green-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent" />

                    <div className="relative">
                      <p className="text-xs text-gray-400">
                        📈 Potential Monthly Savings
                      </p>

                      <p className="text-base sm:text-lg font-semibold text-green-400">
                        {currency_str}
                        {latestAnalysis.impact.savingsPotential}
                        /month
                      </p>

                      <p className="text-[10px] text-gray-500">
                        ≈ {currency_str}
                        {latestAnalysis.impact.projectedSavings} in 3 months
                      </p>

                      <p className="text-[10px] text-gray-500 mt-1">
                        Small optimizations → big long-term impact 🚀
                      </p>
                    </div>
                  </div>
                )}

                {/* DOWNLOAD */}
                <button
                  onClick={downloadResult}
                  className="w-full text-xs sm:text-sm 
      bg-linear-to-r from-blue-500/20 to-purple-500/20 
      hover:from-blue-500/30 hover:to-purple-500/30 
      transition p-2 rounded-lg 
      border border-white/10 
      backdrop-blur"
                >
                  📥 Download Report
                </button>
              </>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AIAnalysis;
