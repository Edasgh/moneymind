"use client";

import { useFinance } from "@/hooks/useFinance";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

export default function EditGoalModal({ onClose, currency_str, goal }: any) {
  const { finance, updateFinanceLocal } = useFinance();
  const [form, setForm] = useState({
    title: goal.title,
    targetAmount: goal.targetAmount,
    deadline: goal.deadline,
    priority: goal.priority,
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.deadline || !form.targetAmount || !finance) return;

    if (
      form.title === goal.title &&
      form.deadline === goal.deadline &&
      form.targetAmount === goal.targetAmount &&
      form.priority === goal.priority
    ) {
      toast.info("No changes added to update!");
      return;
    }

    try {
      const res = await fetch(`/api/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, goalId: goal._id }),
      });

      const updatedGoal = {
        _id: goal._id,
        ...goal,
        ...form,
      };

      if (res.ok) {
        updateFinanceLocal({
          goals: finance.goals.map((goal) =>
            String(goal._id) === String(updatedGoal._id) ? updatedGoal : goal,
          ),
        });
        toast.success("Goal edited 🚀");
      } else {
        toast.error("Failed to edit Goal!");
      }
    } catch (error) {
      console.log("Error in Goal Edit : ", error);
      toast.error("Failed to edit Goal!");
    } finally {
      onClose();
    }
  };

  currency_str = currency_str ?? "₹";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
      <div className="bg-black border border-white/10 rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Edit Goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* TITLE */}
          <div>
            <label className="text-xs text-gray-400">Title</label>
            <input
              placeholder="Buy a Car, Build a Studio..."
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10"
            />
          </div>
          {/* TARGET AMOUNT */}
          <div>
            <label className="text-xs text-gray-400">Target Amount</label>
            <input
              type="number"
              placeholder={`${currency_str}500`}
              value={form.targetAmount}
              onChange={(e) => handleChange("targetAmount", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10"
            />
          </div>
          {/* PRIORITY */}
          <div>
            <label className="text-xs text-gray-400">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10"
            >
              <option value="">Select</option>
              <option value="low">🔵 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          {/* DEADLINE DATE */}
          <div>
            <label className="text-xs text-gray-400">Deadline </label>
            <input
              type="date"
              value={
                form.deadline
                  ? new Date(form.deadline).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleChange("deadline", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 shadow-lg hover:scale-[1.02] transition"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
