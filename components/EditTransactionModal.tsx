"use client";

import { useFinance } from "@/hooks/useFinance";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

export default function EditTransactionModal({
  onClose,
  currency_str,
  transaction,
}: any) {
  const { finance, updateFinanceLocal } = useFinance();
  const [form, setForm] = useState({
    date: transaction.date,
    mode: transaction.mode,
    category: transaction.category,
    amount: transaction.amount,
    type: transaction.type,
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.amount || !finance) return;
    if (
      form.amount === transaction.amount &&
      form.category === transaction.category &&
      form.type === transaction.type &&
      form.mode === transaction.mode &&
      form.date === transaction.date
    ) {
      toast.info("No changes made to save!");
      return;
    }
    try {
      const res = await fetch(`/api/transaction`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, transactionId: transaction._id }),
      });

      const updatedTx = {
        _id: transaction._id,
        ...form,
      };

      if (res.ok) {
        updateFinanceLocal({
          transactions: finance.transactions.map((tx) =>
            String(tx._id) === String(updatedTx._id) ? updatedTx : tx,
          ),
        });
        toast.success("Transaction edited 🚀");
      } else {
        toast.error("Failed to edit Transaction!");
      }
    } catch (error) {
      console.log("Error in Transaction Edit : ", error);
      toast.error("Failed to edit Transaction!");
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
          <h2 className="text-lg font-semibold">Edit Transaction</h2>
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
              value={
                form.date ? new Date(form.date).toISOString().split("T")[0] : ""
              }
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
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Net Banking / Bank Transfer</option>
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
              placeholder={`${currency_str}500`}
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
