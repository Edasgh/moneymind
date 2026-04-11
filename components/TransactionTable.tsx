import React from "react";

export default function TransactionTable({
  transactions,
  GlassCard,
}: {
  transactions: any[];
  GlassCard: React.ComponentType<{ children: React.ReactNode }>;
}) {
  return (
    <GlassCard>
      <p className="text-sm text-gray-400 mb-3">All Transactions</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-gray-400 text-left">
            <tr>
              <th>Date</th>
              <th>Mode</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-t border-white/10 text-left py-1.5">
                <td>{t.date}</td>
                <td>{t.mode}</td>
                <td>{t.category}</td>
                <td className={t.type==="Expense"?"text-red-400":"text-green-400"}>₹{t.amount}</td>
                <td>{t.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
