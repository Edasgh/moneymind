"use client";

import { FormEvent, useState } from "react";

export default function AddTransactionModal({ onClose, onAdd }: any) {
  const [form, setForm] = useState({
    date: "",
    mode: "",
    category: "",
    amount: "",
    type: "Expense",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = (e:FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.amount) return;

    onAdd(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
      <div className="bg-black border border-white/10 rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* DATE */}
          <div>
            <label className="text-xs text-gray-400">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* MODE */}
          <div>
            <label className="text-xs text-gray-400">Mode</label>
            <select
              value={form.mode}
              onChange={(e) => handleChange("mode", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10"
            >
              <option value="">Select</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Cash</option>
              <option>Net Banking</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-xs text-gray-400">Category</label>
            <input
              placeholder="Food, Shopping..."
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10"
            />
          </div>

          {/* AMOUNT */}
          <div>
            <label className="text-xs text-gray-400">Amount</label>
            <input
              type="number"
              placeholder="₹500"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10"
            />
          </div>

          {/* TYPE */}
          <div>
            <label className="text-xs text-gray-400">Type</label>
            <div className="flex gap-2 mt-2">
              {["Expense", "Income"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleChange("type", t)}
                  className={`flex-1 py-2 rounded-xl border transition ${
                    form.type === t
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
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
