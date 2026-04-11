"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function SpendingChart({ breakdown }: any) {
  if (!breakdown) return null;

  const data = [
    { name: "Essential", value: breakdown.essential },
    { name: "Lifestyle", value: breakdown.lifestyle },
    { name: "Impulsive", value: breakdown.impulsive },
  ];

  return (
    <div className="bg-gray-900 p-5 rounded-xl">
      <h2 className="text-white text-lg mb-4">Spending Breakdown</h2>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={50} outerRadius={80}>
              {data.map((_, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Labels */}
      <div className="mt-4 text-sm text-gray-300">
        <p>🧱 Essential: ₹{breakdown.essential}</p>
        <p>🎯 Lifestyle: ₹{breakdown.lifestyle}</p>
        <p>🔥 Impulsive: ₹{breakdown.impulsive}</p>
      </div>
    </div>
  );
}
