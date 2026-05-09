"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";



export default function SpendingChart({
  transactionsLength,
  breakdown,
  currency_str,
}: {
  transactionsLength: number;
  breakdown: any;
  currency_str?: string;
}) {
  if (!breakdown) return null;

  const data = [
    {
      name: "Essential",
      value: Number(Number(breakdown.essential).toFixed(2)),
    },
    {
      name: "Lifestyle",
      value: Number(Number(breakdown.lifestyle).toFixed(2)),
    },
    {
      name: "Impulsive",
      value: Number(Number(breakdown.impulsive).toFixed(2)),
    },
  ];

  const COLORS = {
    Essential: "#07BC0C",
    Lifestyle: "#8b5cf6",
    Impulsive: "#ef4444",
  };

  const format = (num: number) =>
    num?.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  currency_str = currency_str ?? "₹";

  return (
    <div className="p-3 rounded-2xl space-y-5">
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-white">
          📊 Spending Breakdown
        </h2>
        <p className="text-xs text-gray-400">Where your money is going</p>
      </div>

      {/* EMPTY STATE */}
      {transactionsLength === 0 ? (
        <div className="space-y-5">
          <div className="h-52 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <div className="text-center space-y-3">
              <div className="text-3xl opacity-60">📊</div>
              <p className="text-sm text-gray-400">Not enough data yet</p>
              <p className="text-[11px] text-gray-500">
                Add transactions to unlock insights
              </p>
            </div>
          </div>

          {/* Ghost legend */}
          <div className="space-y-2 text-xs text-gray-500 opacity-50">
            <p>🧱 Essential: --</p>
            <p>🎯 Lifestyle: --</p>
            <p>🔥 Impulsive: --</p>
          </div>
        </div>
      ) : (
        <>
          {/* CHART */}
          <div className="flex justify-center">
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.85)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LEGEND */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: COLORS[item.name as keyof typeof COLORS],
                  }}
                />
                <div>
                  <p className="text-gray-400">{item.name}</p>
                  <p className="text-white font-medium">
                    {currency_str}
                    {format(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* INFO */}
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Helps you identify essential vs lifestyle vs impulsive spending
            patterns.
          </p>
        </>
      )}
    </div>
  );
}
