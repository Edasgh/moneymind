"use client";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface Statement {
  _id: string;
  fileName: string;
  status: string;
  extractedTransactions?: any[];
  summary?: any;
}

interface Finance {
  _id: string;
  monthlyIncome: number;
  transactions: any[];
  goals: any[];
  aiHistory: any[];
  prediction: {
    nextMonthExpense: number;
    confidence: string;
    reason: string;
  };
  breakdown: {
    essential: number;
    lifestyle: number;
    impulsive: number;
    updatedAt: Date;
  };
}

interface FinanceContextType {
  statements: Statement[];
  finance: Finance | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

// =========================
// 🚀 PROVIDER
// =========================
export const FinanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session } = useSession();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [finance, setFinance] = useState<Finance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/profile");
      const data = await res.json();

      if (res.ok) {
        setStatements(data.statements || []);
        setFinance(data.financeDoc || null);
      }
    } catch (err) {
      console.error("Finance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchFinanceData();
    }
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        statements,
        finance,
        loading,
        refresh: fetchFinanceData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// =========================
// 🧠 HOOK
// =========================
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
};
