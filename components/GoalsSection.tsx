"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/app/analyze/page";
import AddGoalModal from "./AddGoalModal";
import { Goal } from "@/hooks/useFinance";
import { PenIcon, Trash2Icon } from "lucide-react";
import { toast } from "react-toastify";
import EditGoalModal from "./EditGoalModal";

export default function GoalsSection({
  isDemo,
  goals,
  onAddGoal,
  currency_str,
}: {
  isDemo: boolean | undefined;
  goals: Goal[];
  onAddGoal: any;
  currency_str?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(goals.length / ITEMS_PER_PAGE);

  const [paginatedGoals, setPaginatedGoals] = useState<Goal[]>([
    ...goals.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    ),
  ]);

  const statusStyles = {
    achieved: "bg-green-500/20 text-green-400 border-green-500/20",
    "at-risk": "bg-red-500/20 text-red-400 border-red-500/20",
    active: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
  };

  currency_str = currency_str ?? "₹";

  const handleAskAI = async (goal: Goal) => {
    if (!goal._id) return;

    setAiLoadingId(goal._id);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "goal",
          goalId: goal._id,
        }),
      });

      const data = await res.json();
      // { type: "bot", text: data.reply }
      setAiInsights((prev) => ({
        ...prev,
        [goal._id!]: data.reply,
      }));

      setActiveTooltip(goal._id);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoadingId(null);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const res = await fetch("/api/goals", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId,
        }),
      });

      if (res.ok) {
        setPaginatedGoals((prev) => prev.filter((p) => p._id !== goalId));
        toast.success("Goal Deleted Successfully 🚀");
      } else {
        toast.error("Failed to delete goal!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (activeTooltip) {
        setActiveTooltip(null);
      }
    }, 6000);
  }, []);

  return (
    <>
      <GlassCard>
        <div className="p-5 space-y-5">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white">
              🎯 Your Financial Goals
            </p>

            <button
              onClick={() => {
                if (isDemo) {
                  toast.error(
                    "Goals are disabled in demo mode. Remove sample data to create your own goals.",
                  );
                } else setShowModal(true);
              }}
              className="text-xs px-3 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition"
            >
              + Add Goal
            </button>
          </div>

          {/* EMPTY */}
          {goals.length === 0 ? (
            <p className="text-xs text-gray-400">
              No goals yet. Start by adding one 🚀
            </p>
          ) : (
            <>
              {/* GOALS LIST */}
              <div className="space-y-3">
                {paginatedGoals.map((goal, i) => {
                  const progress = goal.progress?.percentage || 0;

                  return (
                    <motion.div
                      key={goal._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3"
                    >
                      {/* TITLE + STATUS */}
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{goal.title}</p>

                        <div className="flex items-center gap-2 relative">
                          {/* STATUS */}
                          {goal.status && (
                            <span
                              className={`text-[10px] px-2 py-1 rounded border ${statusStyles[goal.status]}`}
                            >
                              {goal.status}
                            </span>
                          )}

                          {/* 🤖 AI BUTTON */}
                          <button
                            onClick={() => handleAskAI(goal)}
                            className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition cursor-pointer"
                          >
                            {aiLoadingId === goal._id
                              ? "Thinking..."
                              : "Ask AI"}
                          </button>

                          {/* Edit Button */}
                          <button
                            title={!isDemo ? "Edit" : "Edit Disabled"}
                            onClick={() => {
                              if (!isDemo) {
                                if (goal._id) {
                                  setSelectedGoal(goal);
                                  setShowEditModal(true);
                                }
                              } else {
                                toast.error(
                                  "In Demo Mode, Goals can't be Edited!",
                                );
                              }
                            }}
                            className="text-[10px] rounded text-blue-400 transition cursor-pointer"
                          >
                            <PenIcon />
                          </button>
                          {/* X Delete Button */}
                          <button
                            title={!isDemo ? "Delete" : "Delete Disabled"}
                            onClick={() => {
                              if (!isDemo) {
                                if (goal._id) {
                                  deleteGoal(goal._id);
                                }
                              } else {
                                toast.error(
                                  "In Demo Mode, Goals can't be Deleted",
                                );
                              }
                            }}
                            className="text-[10px] rounded text-red-400 transition cursor-pointer"
                          >
                            <Trash2Icon />
                          </button>

                          {/* 💬 TOOLTIP */}
                          {activeTooltip === goal._id &&
                            aiInsights[goal._id!] && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-8 z-50 w-56 h-fit p-3 rounded-xl bg-black border border-white/10 text-[11px] text-gray-300 shadow-lg"
                              >
                                {aiInsights[goal._id!]}

                                {/* close */}
                                <button
                                  onClick={() => setActiveTooltip(null)}
                                  className="absolute top-1 right-2 text-xs text-gray-500 hover:text-white"
                                >
                                  ✕
                                </button>
                              </motion.div>
                            )}
                        </div>
                      </div>

                      {/* AMOUNT */}
                      <p className="text-xs text-gray-400">
                        {currency_str}
                        {goal.progress?.savedAmount || 0} / {currency_str}
                        {goal.targetAmount}
                      </p>

                      {/* PROGRESS BAR */}
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                          }}
                        />
                      </div>

                      {/* PERCENT */}
                      <p className="text-[10px] text-gray-400 text-right">
                        {Math.round(progress)}%
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-xs px-3 py-1 rounded bg-white/10 disabled:opacity-40 hover:bg-white/20 transition"
                  >
                    Prev
                  </button>

                  <p className="text-[11px] text-gray-400">
                    Page {currentPage} / {totalPages}
                  </p>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="text-xs px-3 py-1 rounded bg-white/10 disabled:opacity-40 hover:bg-white/20 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </GlassCard>

      {/* MODAL */}
      {showModal && (
        <AddGoalModal
          onClose={() => setShowModal(false)}
          onAdd={onAddGoal}
          currency_str={currency_str}
        />
      )}
      {showEditModal && selectedGoal && (
        <EditGoalModal
          onClose={() => {
            setShowEditModal(false);
            setSelectedGoal(null);
          }}
          currency_str={currency_str}
          goal={selectedGoal}
        />
      )}
    </>
  );
}
