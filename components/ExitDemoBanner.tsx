"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Database, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ExitDemoBanner({
  refresh,
}: {
  refresh: () => Promise<void>;
}) {
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(false);

  const deleteDemoData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/loadDemo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      toast.success("Demo data removed");

      setShowBanner(false);

      await refresh();
    } catch (error) {
      console.error("Error deleting demo data:", error);

      toast.error("Failed to delete demo data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-linear-to-br from-purple-500/10 via-[#0a0a0a] to-black p-6 shadow-2xl"
        >
          {/* BACKGROUND GLOW */}
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 z-20 rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* CONTENT */}
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}
            <div className="max-w-2xl">
              {/* BADGE */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-purple-300" />

                <span className="text-[11px] font-medium uppercase tracking-wider text-purple-300">
                  Demo Mode Active
                </span>
              </div>

              {/* TITLE */}
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Ready to use your real finances?
              </h2>

              {/* DESCRIPTION */}
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-[15px]">
                Import your real transactions and goals to unlock personalized
                AI insights, smarter forecasts, accurate budgeting analysis, and
                long-term financial planning tailored to your actual spending.
              </p>

              {/* FEATURES */}
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "AI Insights",
                  "Expense Tracking",
                  "Goal Forecasting",
                  "Smart Predictions",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-300 backdrop-blur-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {/* DELETE DEMO */}
              <button
                onClick={deleteDemoData}
                title="Delete Demo Data"
                disabled={loading}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Database className="h-4 w-4" />

                {loading ? "Removing..." : "Use Real Data"}

                {!loading && (
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                )}
              </button>

              {/* CONTINUE DEMO */}
              <button
                onClick={() => setShowBanner(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-gray-300 transition hover:bg-white/10"
              >
                Continue Demo
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
