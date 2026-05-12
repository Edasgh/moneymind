"use client";
import { useSession } from "next-auth/react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface Statement {
  _id: string;
  fileName: string;
  status: string;
  extractedTransactions?: any[];
  summary?: any;
}

export interface Transaction {
  amount: number;
  category: string;
  type: "Income" | "Expense";
  mode: string;
  date: string;
}

export interface Goal {
  _id?: string;
  title: string;
  targetAmount: number;
  deadline: Date;
  priority: "low" | "medium" | "high";
  status?: "active" | "at-risk" | "achieved";
  progress?: {
    savedAmount: number;
    percentage: number;
  };
}

interface LifeMetrics {
  financialStabilityScore: number;
  survivalMonths: number;
  stressRisk: "low" | "medium" | "high";
  savingsRate: number;
  emergencyFundStatus: "poor" | "average" | "good";
}

export interface Gamification {
  level: number;
  xp: number;
  streaks: {
    underBudgetDays: number;
  };
  achievements: {
    title: string;
    unlockedAt: Date;
  }[];
}

export interface Finance {
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
  lifeMetrics?: LifeMetrics;
  gamification?: Gamification;
  isDemo?:boolean;
}

interface FinanceContextType {
  statements: Statement[];
  finance: Finance | null;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  refresh: () => Promise<void>;
  // partial update (for UI responsiveness)
  updateFinanceLocal: (data: Partial<Finance>) => void;
  updateStatementsLocal: (data: Partial<Statement>) => void;
  deleteStatementLocal:(id:string)=>void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

// =========================
//  PROVIDER
// =========================
export const FinanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [finance, setFinance] = useState<Finance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/profile");
      const data = await res.json();

      if (res.ok) {
        setStatements(data.statements || []);
        setFinance(data.financeDoc || null);
      } else {
        throw new Error("Failed to fetch finance data");
      }
    } catch (err: any) {
      console.error("Finance fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchFinanceData();
    }
  }, [status]);

  // =========================
  //  LOCAL UPDATE 
  // =========================

  // update finance (LOCAL)
  const updateFinanceLocal = (data: Partial<Finance>) => {
    setFinance((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        ...data,
      };
    });
  };

  // update statements array (LOCAL)
  const updateStatementsLocal = (data: Partial<Statement>) => {
    setStatements((prev) => {
      // if no _id, just append
      if (!data._id) {
        return [...prev, data as Statement];
      }

      const exists = prev.some((s) => s._id === data._id);

      if (exists) {
        // update existing
        return prev.map((s) => (s._id === data._id ? { ...s, ...data } : s));
      }

      // add new
      return [...prev, data as Statement];
    });
  };


  const deleteStatementLocal = (statementId:string)=>{
     setStatements((prev) => prev.filter((s) => s._id !== statementId));
  }

  return (
    <FinanceContext.Provider
      value={{
        statements,
        finance,
        loading,
        setLoading,
        error,
        refresh: fetchFinanceData,
        updateFinanceLocal,
        updateStatementsLocal,
        deleteStatementLocal
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// =========================
//  HOOK
// =========================
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
};
