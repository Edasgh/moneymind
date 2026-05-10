"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const demoCategories = [
  {
    id: "student",
    emoji: "👨‍🎓",
    title: "Student",
    description: "Low income, budgeting, savings goals",
  },

  {
    id: "professional",
    emoji: "👩‍💻",
    title: "Young Professional",
    description: "Salary, investments, lifestyle spending",
  },

  {
    id: "family",
    emoji: "👨‍👩‍👧",
    title: "Family Budget",
    description: "Household expenses, education, stability",
  },

  {
    id: "freelancer",
    emoji: "🧑‍🎨",
    title: "Freelancer",
    description: "Irregular income, business expenses",
  },
];

export default function DemoDataModal({
  setFinanceLoading,
  refresh,
}: {
  setFinanceLoading: Dispatch<SetStateAction<boolean>>;
  refresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadDemoData = async (type: string) => {
    try {
      setLoading(true);
      setFinanceLoading(true);

      const res = await fetch("/api/loadDemo", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          option: type,
        }),
      });

      if (res.ok) {
        toast.success("Demo data loaded successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);

      refresh();
    }
  };

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
      >
        Use Sample Data
      </button>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Try Demo Data
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Explore MoneyMind with realistic financial profiles.
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* OPTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoCategories.map((item) => (
                  <button
                    key={item.id}
                    disabled={loading}
                    onClick={() => loadDemoData(item.id)}
                    className="group text-left p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{item.emoji}</div>

                      <div>
                        <p className="text-white font-medium text-base group-hover:text-purple-300 transition">
                          {item.title}
                        </p>

                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-200 leading-relaxed">
                  Demo profiles include transactions, goals, AI insights,
                  budgeting patterns, and financial analysis so you can explore
                  the full experience instantly.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
