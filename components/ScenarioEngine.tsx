"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Finance } from "@/hooks/useFinance";

type Scenario = {
  name: string;
  type: "buy" | "invest" | "reduce";
  value: number;
};

export default function ScenarioEngine({
  finance,
  currency_str,
}: {
  finance: Finance;
  currency_str?: string;
}) {
  if (!finance) return null;

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [form, setForm] = useState({
    name: "",
    cost: "",
  });
  const [type, setType] = useState<Scenario["type"]>("buy");

  const [result, setResult] = useState<any[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // ➕ Add scenario
  const addScenario = () => {
    console.log(scenarios);
    if (!form.name.length || !Number(form.cost)) return;

    setScenarios((prev) => [
      ...prev,
      { name: form.name, type, value: Number(form.cost) },
    ]);

    setForm({ name: "", cost: "" });
  };

  // ❌ Remove scenario
  const removeScenario = (index: number) => {
    setScenarios((prev) => prev.filter((_, i) => i !== index));
  };

  // 🚀 Run simulation
  const runScenario = async () => {
    if (scenarios.length === 0) return;

    setLoading(true);

    const formatted = scenarios.map((s) => {
      if (s.type === "buy") return { name: s.name, cost: s.value };
      if (s.type === "invest") return { name: s.name, monthly: s.value };
      if (s.type === "reduce") return { name: s.name, reduce: s.value };
    });

    const res = await fetch("/api/scenario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenarios: formatted }),
    });

    const data = await res.json();

    setResult(data.results || []);
    setExplanation(data.explanation || "");
    setLoading(false);
  };

  currency_str = currency_str ?? "₹";

  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5 flex-1 w-full">
      {/* HEADER */}
      <p className="text-sm font-medium text-white mb-4">
        🔄 Scenario Comparison
      </p>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Define financial decisions to compare their impact on your savings and
        goals.
      </p>

      {/* ➕ ADD SCENARIO */}
      <div className="flex flex-col gap-2 mt-2 mb-3">
        <input
          placeholder={
            type === "buy"
              ? "e.g. Buy iPhone / Laptop"
              : type === "invest"
                ? "e.g. SIP in Mutual Fund"
                : "e.g. Cut food expenses"
          }
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm"
        >
          <option value="buy">Buy (one-time)</option>
          <option value="invest">Invest monthly</option>
          <option value="reduce">Reduce expense</option>
        </select>

        <p className="text-[10px] text-gray-500 mt-1">
          {type === "buy"
            ? "This will reduce your current savings instantly."
            : type === "invest"
              ? "This will grow over time but reduce monthly cash flow."
              : "This increases your savings each month."}
        </p>

        <div className="flex items-center justify-start w-full gap-2">
          <span className=" text-gray-500 text-sm">{currency_str}</span>

          <input
            type="number"
            value={form.cost}
            placeholder={
              type === "buy"
                ? `One-time cost (${currency_str})`
                : type === "invest"
                  ? `Monthly investment (${currency_str})`
                  : `Monthly savings (${currency_str})`
            }
            onChange={(e) => handleChange("cost", e.target.value)}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm w-full"
            suppressContentEditableWarning
          />
        </div>
      </div>

      <button
        onClick={addScenario}
        className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm"
      >
        ➕ Add Scenario
      </button>

      {/* 📦 ADDED SCENARIOS */}
      {scenarios.length > 0 && (
        <div className="space-y-2">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/10 text-xs"
            >
              <div>
                <p className="text-white text-sm">{s.name}</p>
                <p className="text-gray-400">
                  {s.type} • {currency_str}
                  {s.value}
                </p>
              </div>

              <button
                onClick={() => removeScenario(i)}
                className="text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 RUN */}
      <button
        onClick={runScenario}
        disabled={loading}
        className="w-full bg-purple-500 py-2 rounded-lg text-sm hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Compare Decisions"}
      </button>

      {/* RESULTS */}
      {result.length > 0 && (
        <div className="space-y-4">
          {result.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-semibold text-base">{r.name}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {r.goalStatus === "on-track"
                      ? "🎯 Goal remains on track"
                      : r.goalStatus === "delayed"
                        ? "⏳ Goal may get delayed"
                        : "🚨 Goal becomes difficult"}
                  </p>
                </div>

                <div
                  className={`px-2 py-1 rounded-full text-[11px] capitalize ${
                    r.stressRisk === "low"
                      ? "bg-green-500/10 text-green-400"
                      : r.stressRisk === "medium"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {r.stressRisk} Risk
                </div>
              </div>

              {/* METRICS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-[11px] text-gray-400">Financial Impact</p>

                  <p
                    className={`text-sm font-semibold mt-1 ${
                      r.netWorthImpact < 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {r.netWorthImpact > 0 ? "+" : ""}
                    {currency_str}
                    {Math.abs(r.netWorthImpact)}
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-[11px] text-gray-400">Monthly Savings</p>

                  <p className="text-sm font-semibold mt-1 text-white">
                    {currency_str}
                    {r.monthlySavings}
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-[11px] text-gray-400">
                    Emergency Survival
                  </p>

                  <p className="text-sm font-semibold mt-1 text-white">
                    {r.survivalMonths} months
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-[11px] text-gray-400">Savings Change</p>

                  <p
                    className={`text-sm font-semibold mt-1 ${
                      r.savingsChangePercent >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {r.savingsChangePercent > 0 ? "+" : ""}
                    {r.savingsChangePercent}%
                  </p>
                </div>
              </div>

              {/* GOAL DELAY */}
              <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-[11px] text-gray-400">Goal Impact</p>

                <p className="text-sm text-white mt-1">
                  {r.goalDelay === null
                    ? "This decision may stop progress toward your goal."
                    : r.goalDelay <= 0
                      ? "No meaningful delay to your goal."
                      : `Goal delayed by ~${r.goalDelay} days.`}
                </p>
              </div>

              {/* SMART INSIGHT */}
              <div className="mt-3 text-[11px] text-gray-400 leading-relaxed">
                {r.stressRisk === "high"
                  ? "⚠️ This decision may create financial pressure and reduce flexibility."
                  : r.stressRisk === "medium"
                    ? "📌 This is manageable with careful budgeting."
                    : "✅ This looks financially sustainable for your current situation."}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🤖 EXPLANATION */}
      {explanation && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-gray-300">
          🤖 {explanation}
        </div>
      )}
    </div>
  );
}
