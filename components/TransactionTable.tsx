import { Transaction } from "@/hooks/useFinance";
import React, { useState } from "react";
import EditTransactionModal from "./EditTransactionModal";
import { toast } from "react-toastify";

export default function TransactionTable({
  onDelete,
  isDemo,
  isManual,
  transactions,
  GlassCard,
  currency_str,
}: {
  onDelete?: (transactionId: string) => Promise<void>;
  isDemo?: boolean | undefined;
  isManual?: boolean;
  transactions: any[];
  GlassCard: React.ComponentType<{ children: React.ReactNode }>;
  currency_str?: string;
}) {
  currency_str = currency_str ?? "₹";
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
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
              {isManual && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-t border-white/10 text-left py-1.5">
                <td>{t.date}</td>
                <td>{t.mode}</td>
                <td>{t.category}</td>
                <td
                  className={
                    t.type === "Expense" ? "text-red-400" : "text-green-400"
                  }
                >
                  {currency_str}
                  {t.amount}
                </td>
                <td>{t.type}</td>
                {isManual && (
                  <>
                    <td
                      onClick={() => {
                        if (!isDemo) {
                          setSelectedTransaction(t);
                          setShowEditModal(true);
                        } else {
                          toast.error(
                            "In Demo Mode, Manual Transactions can't be Edited!",
                          );
                        }
                      }}
                      className={`${isDemo && "italic"} text-blue-300 hover:text-blue-500 cursor-pointer text-[10px]`}
                    >
                      {isDemo ? "Edit Disabled" : "Edit"}
                    </td>
                    <td
                      onClick={() => onDelete && onDelete(t._id)}
                      className={`${isDemo ? "text-purple-300 hover:text-purple-400 italic" : "text-red-300 hover:text-red-500"} cursor-pointer text-[10px]`}
                    >
                      {isDemo ? "Delete Disabled" : "Delete"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showEditModal && selectedTransaction && (
        <div className="relative z-50 min-h-screen lg:min-h-fit w-full">
          <EditTransactionModal
            onClose={() => {
              setShowEditModal(false);
              setSelectedTransaction(null);
            }}
            currency_str={currency_str}
            transaction={selectedTransaction}
          />
        </div>
      )}
    </GlassCard>
  );
}
