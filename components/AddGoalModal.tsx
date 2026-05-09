"use client";

import { FormEvent, useState } from "react";

export default function AddGoalModal({ onClose, onAdd, currency_str }: any) {
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    priority: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.deadline || !form.targetAmount) return;

    onAdd(form);
    onClose();
  };

  currency_str = currency_str ?? "₹";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
      <div className="bg-black border border-white/10 rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Add a Goal</h2>
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
              value={form.deadline}
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
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
