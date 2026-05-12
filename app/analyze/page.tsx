"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionTable from "@/components/TransactionTable";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import NotFound from "../not-found";
import UploadStatement from "@/components/UploadStatement";

import { Goal, Transaction, useFinance } from "@/hooks/useFinance";
import SpendingChart from "@/components/SpendingChart";

// gamification, lifemetrics, scenario simulation added
import GamificationCard from "@/components/GamificationCard";
import LifeImpactCard from "@/components/LifeImpactCard";
import ScenarioEngine from "@/components/ScenarioEngine";
import { currencyMap } from "@/lib/currencyMap";
import StatementsCard from "@/components/StatementsCard";
import GoalsSection from "@/components/GoalsSection";
import AIAnalysis from "@/components/AIAnalysis";
import { convertToPdf } from "@/lib/convertToPdf";
import DemoDataModal from "@/components/DemoDataModal";
import ExitDemoBanner from "@/components/ExitDemoBanner";

export default function Analyze() {
  const { data: session } = useSession();
  const {
    finance,
    statements: fianceStatements,
    updateFinanceLocal,
    loading,
    setLoading,
    refresh,
  } = useFinance();
  const latestAnalysis = finance?.aiHistory?.at(-1);

  const [simulateValue, setSimulateValue] = useState(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);

  const router = useRouter();

  const [income, setIncome] = useState("0");

  const [showAddModal, setShowAddModal] = useState(false);
  //  Manual transactions
  const [manualTransactions, setManualTransactions] = useState<any[]>([]);
  //  Statements
  const [statements, setStatements] = useState<
    {
      _id: string;
      fileName: string;
      status: string;
      extractedTransactions?: any[];
      summary?: any;
    }[]
  >([]);

  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(
    null,
  );
  const [showUpload, setShowUpload] = useState(false);

  // =========================
  //  ALL TRANSACTIONS (AI USES THIS)
  // =========================
  const allTransactions = [
    ...manualTransactions,
    ...statements.flatMap((s) => s.extractedTransactions || []),
  ];

  // =========================
  //  SELECTED STATEMENT DATA
  // =========================
  const selectedTransactions =
    statements.find((s) => s._id === selectedStatementId)
      ?.extractedTransactions || [];

  // =========================
  // 📊 SUMMARY (BASED ON ALL DATA)
  // =========================
  const totalSpent = allTransactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalIncome = allTransactions
    .filter((t) => t.type === "Income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  useEffect(() => {
    if (fianceStatements) {
      setStatements(fianceStatements);
    }
  }, [fianceStatements]);

  useEffect(() => {
    if (finance) {
      if (finance.transactions) {
        setManualTransactions(finance.transactions);
      }
      setIncome(finance.monthlyIncome.toString());
    }
  }, [finance]);

  // change monthly income on mouse out
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changeMonthlyIncome = () => {
    if (!income || Number(income) <= 0) {
      toast.error("Invalid income input!");
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          financeId: finance?._id,
          monthlyIncome: Number(income),
        }),
      });
      updateFinanceLocal({
        monthlyIncome: Number(income),
      });
    }, 800); // wait 800 ms
  };

  const simulate = async () => {
    if (simulateValue <= 0) return;
    setSimulationLoading(true);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reduction: simulateValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Simulation failed");
        return;
      }

      setSimulationResult(data);

      toast.success("Future updated based on your decision 🚀");
    } catch (error) {
      console.log(error);

      toast.error("Failed to simulate savings");
    } finally {
      setSimulationLoading(false);
    }
  };

  const deleteManualTransaction = async (transactionId: string) => {
    // console.log("Transaction id : ",transactionId)
    if (finance?.isDemo) {
      toast.error("In Demo Mode, Manual Transactions can't be Deleted!");
    } else {
      try {
        const res = await fetch("/api/transaction", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
          }),
        });

        if (res.ok) {
          toast.success("Transaction deleted Successfully 🚀");
          setManualTransactions((tx) =>
            tx.filter((t: any) => t._id !== transactionId),
          );
        } else {
          toast.error("Failed to delete Transaction!");
        }
      } catch (error) {
        toast.error("Failed to delete Transaction!");
      }
    }
  };

  const currency_str =
    currencyMap[
      session?.user?.country ?? ("India" as keyof typeof currencyMap)
    ] || "₹";

  const downloadResult = () => {
    convertToPdf(latestAnalysis, currency_str);
  };

  let scoreColor = "text-red-400";

  if (latestAnalysis) {
    scoreColor =
      latestAnalysis.score > 75
        ? "text-green-400"
        : latestAnalysis.score > 50
          ? "text-yellow-400"
          : "text-red-400";
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!session) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen h-auto bg-black text-white px-3 md:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-blue-500/10 blur-[120px]" />
        </div>

        {/* NAVBAR */}
        <nav className="flex flex-wrap gap-3 justify-between items-center max-w-6xl mx-auto mb-6 md:mb-10">
          <Link href="/" className="text-lg font-semibold">
            🧠 MoneyMind
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="bg-linear-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition"
            >
              🤖 Ask AI
              <ArrowRight size={16} />
            </Link>

            {session && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                <span
                  onClick={() => router.push("/profile")}
                  className="text-xs text-gray-300 cursor-pointer"
                >
                  {session?.user?.name && (
                    <>
                      {session?.user?.name.length > 10 ? (
                        <>{session?.user?.name.slice(0, 10)}..</>
                      ) : (
                        <>{session?.user?.name}</>
                      )}
                    </>
                  )}
                </span>
                <div className="w-px h-3.25 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                <button
                  onClick={() => signOut()}
                  className="text-xs text-red-400 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {showAddModal && (
          <AddTransactionModal
            onClose={() => {
              setShowAddModal(false);
            }}
            currency_str={currency_str}
            onAdd={async (tx: Transaction) => {
              const res = await fetch("/api/transaction", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(tx),
              });

              const data = await res.json();

              if (res.ok) {
                updateFinanceLocal({ transactions: data.transactions });
                setManualTransactions(data.transactions);
                setShowAddModal(false);
                toast.success("Transaction added 🚀");
              } else {
                toast.error("Failed to add transaction");
              }
            }}
          />
        )}

        {finance?.isDemo && (
          <div className="space-y-4 mb-6">
            {/* DEMO BADGE */}
            <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />

                <span className="text-sm font-medium text-blue-200">
                  Demo Mode Active
                </span>
              </div>

              <span className="text-[11px] text-blue-300/80">
                Using simulated financial data
              </span>
            </div>

            {/* EXIT BANNER */}
            <ExitDemoBanner refresh={refresh} />
          </div>
        )}

        {/* SUMMARY */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {/* INCOME */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/10 rounded-xl" />
            </div>

            {/* SPENT */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="h-6 w-32 bg-white/10 rounded" />
            </div>

            {/* BALANCE */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="h-6 w-32 bg-white/10 rounded" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard>
              <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
              <input
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                onBlur={changeMonthlyIncome}
                placeholder={`${currency_str}25000`}
                className="w-full p-3 text-base md:text-sm rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </GlassCard>
            <Card
              title="Spent"
              red={true}
              value={`${currency_str}${totalSpent}`}
            />
            <Card
              title="Balance"
              green={true}
              value={`${currency_str}${totalIncome - totalSpent}`}
            />
          </div>
        )}

        {!loading && allTransactions.length === 0 && setLoading && (
          <DemoDataModal refresh={refresh} setFinanceLoading={setLoading} />
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: STATEMENTS */}
          <div className="lg:col-span-2 space-y-4">
            {/* 🎮 GAMIFICATION & 🧠 LIFE IMPACT */}
            <div className="flex flex-col md:flex-row w-full justify-center items-start gap-4">
              {/* 🎮 GAMIFICATION */}
              {loading ? (
                <GamificationLoader />
              ) : (
                <div className="flex-1">
                  {finance && (
                    <>
                      {allTransactions.length < 10 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 25 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-2xl border border-white/10 bg-linear-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl space-y-4"
                        >
                          {/* HEADER */}
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-white">
                              🎮 Your Progress
                            </p>

                            <span className="text-xs px-2 py-1 bg-white/10 rounded-lg text-gray-400">
                              Locked
                            </span>
                          </div>

                          {/* LOCKED STATE */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                            {/* ICON + TEXT */}
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">🔒</div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Gamification Locked
                                </p>
                                <p className="text-xs text-gray-400">
                                  Start tracking transactions to unlock progress
                                  tracking
                                </p>
                              </div>
                            </div>

                            {/* PROGRESS */}
                            <div>
                              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>Data Progress</span>
                                <span>{allTransactions.length}/10</span>
                              </div>

                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      (allTransactions.length / 10) * 100,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* INFO */}
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Earn XP, unlock achievements, and build streaks
                              once enough data is available.
                            </p>

                            {/* PREVIEW (ghost achievements) */}
                            <div className="flex gap-2 opacity-40">
                              <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 border border-green-500/20">
                                📈 High Discipline
                              </span>
                              <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 border border-green-500/20">
                                🔥 Budget Master
                              </span>
                            </div>

                            {/* CTA */}
                            <button
                              onClick={() => {
                                if (Number(income) <= 0) {
                                  toast.error(
                                    "Enter your monthly income amount first",
                                  );
                                } else {
                                  setShowUpload(true);
                                }
                              }}
                              className="w-full text-xs py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                            >
                              Start Tracking
                            </button>

                            {/* TIP */}
                            <p className="text-[10px] text-gray-500 text-center">
                              Tip: Consistent tracking unlocks streaks & rewards
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          {finance.gamification && (
                            <GamificationCard game={finance.gamification} />
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* 🧠 LIFE IMPACT */}
              {loading ? (
                <LifeImpactCardLoader />
              ) : (
                <>
                  {finance && (
                    <div className="flex-1">
                      {allTransactions.length < 15 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full p-5 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl space-y-4"
                        >
                          {/* HEADER */}
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-white">
                                🧠 Life Impact
                              </p>
                              <p className="text-[11px] text-gray-500">
                                Understand how your finances affect your life
                              </p>
                            </div>

                            <span className="text-xs px-2 py-1 bg-white/10 rounded-lg text-gray-400">
                              Locked
                            </span>
                          </div>

                          {/* LOCKED CARD */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                            {/* ICON + TEXT */}
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">🔒</div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Life Impact Insights Locked
                                </p>
                                <p className="text-xs text-gray-400">
                                  Not enough data to evaluate financial
                                  stability & risk
                                </p>
                              </div>
                            </div>

                            {/* PROGRESS */}
                            <div>
                              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>Data Progress</span>
                                <span>{allTransactions.length}/15</span>
                              </div>

                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      (allTransactions.length / 15) * 100,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* PREVIEW METRICS (ghost UI) */}
                            <div className="grid grid-cols-2 gap-3 opacity-40">
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[10px] text-gray-400">
                                  Stability
                                </p>
                                <p className="text-lg font-semibold">--%</p>
                              </div>

                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[10px] text-gray-400">
                                  Stress Risk
                                </p>
                                <p className="text-lg font-semibold">--</p>
                              </div>
                            </div>

                            {/* INFO */}
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              This section analyzes your savings, spending
                              habits, and financial buffer to estimate stability
                              and risk levels.
                            </p>

                            {/* CTA */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (Number(income) <= 0) {
                                    toast.error(
                                      "Enter your monthly income amount first",
                                    );
                                  } else {
                                    setShowUpload(true);
                                  }
                                }}
                                className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                              >
                                Upload Data
                              </button>

                              <button
                                onClick={() => {
                                  if (Number(income) <= 0) {
                                    toast.error(
                                      "Enter your monthly income amount first",
                                    );
                                  } else {
                                    setShowAddModal(true);
                                  }
                                }}
                                className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                              >
                                Add Transactions
                              </button>
                            </div>

                            {/* TIP */}
                            <p className="text-[10px] text-gray-500 text-center">
                              Tip: At least 1–2 months of activity gives
                              accurate life insights
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <LifeImpactCard
                          metrics={{
                            financialStabilityScore: Math.min(
                              100,
                              Math.round(
                                ((totalIncome - totalSpent) /
                                  (Number(income) || 1)) *
                                  100,
                              ),
                            ),
                            survivalMonths:
                              (totalIncome - totalSpent) /
                              (totalSpent / 3 || 1),
                            stressRisk:
                              (totalIncome - totalSpent) /
                                (totalSpent / 3 || 1) <
                              2
                                ? "high"
                                : (totalIncome - totalSpent) /
                                      (totalSpent / 3 || 1) <
                                    5
                                  ? "medium"
                                  : "low",
                          }}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ----------------------------------------------------------------------------- */}
            {/* SIMULATION & SCENARIO ENGINE */}
            {!loading && finance && (
              <div className="flex flex-wrap justify-between w-full items-start gap-2">
                {/* 🎮 SIMULATION */}
                {allTransactions.length > 10 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 w-full"
                  >
                    <GlassCard gradient>
                      <div className="space-y-4">
                        {/* HEADER */}
                        <p className="text-sm font-medium text-white">
                          🎮 Simulate Savings Impact
                        </p>

                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Simulate how reducing your spending affects your
                          savings, goals, and next month's financial health.
                        </p>

                        {/* INPUT */}
                        <div className="relative flex w-full justify-start items-center">
                          <label
                            htmlFor="simulate_val"
                            className="text-xs text-gray-400 mb-1 block"
                          >
                            Monthly savings target
                          </label>
                          <div className="flex w-full justify-center items-center gap-2">
                            <span className="text-gray-500 text-sm">
                              {currency_str}
                            </span>
                            <input
                              type="number"
                              placeholder="5000"
                              id="simulate_val"
                              onChange={(e) =>
                                setSimulateValue(Number(e.target.value))
                              }
                              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>

                        {/* BUTTON */}
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={simulate}
                          disabled={simulationLoading}
                          className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-90 transition px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {simulationLoading ? "Running..." : "Run Simulation"}
                        </motion.button>

                        {/* RESULT */}
                        {simulationResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
                          >
                            <p className="text-xs text-gray-400">
                              Estimated Financial Impact
                            </p>

                            <p className="text-lg font-semibold text-green-400 mt-1">
                              +{currency_str}
                              {simulationResult.savingsGain}/month
                            </p>

                            <div className="mt-3 space-y-1 text-xs text-gray-400">
                              <p>
                                📈 Savings Rate:
                                <span className="text-white ml-1">
                                  {simulationResult.newSavingsRate}%
                                </span>
                              </p>

                              <p>
                                💰 Yearly Impact:
                                <span className="text-white ml-1">
                                  {currency_str}
                                  {simulationResult.yearlyImpact}
                                </span>
                              </p>

                              <p>
                                🧠 Main Spending Area:
                                <span className="text-white ml-1">
                                  {simulationResult.topCategory}
                                </span>
                              </p>
                            </div>

                            <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
                              {simulationResult.message}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* 🔄 SCENARIO ENGINE */}
                {allTransactions.length > 10 && (
                  <ScenarioEngine
                    finance={finance}
                    currency_str={currency_str}
                  />
                )}
              </div>
            )}
            {/* ------------------------------------------------------------------------------ */}
            {/* STATEMENTS & GOALS */}
            <div className="flex flex-col-reverse justify-between items-start gap-2">
              {loading ? (
                <StatementsGoalsLoader />
              ) : (
                <>
                  <div className="flex-1 w-full">
                    <GlassCard>
                      <StatementsCard
                        finance={finance}
                        statements={statements}
                        income={income}
                        selectedStatementId={selectedStatementId}
                        setSelectedStatementId={setSelectedStatementId}
                        setShowUpload={setShowUpload}
                        refresh={refresh}
                      />
                    </GlassCard>
                  </div>
                  {/* 🎯 GOALS */}
                  {finance && allTransactions.length > 15 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="flex-1 w-full"
                    >
                      <GoalsSection
                        isDemo={finance.isDemo}
                        goals={finance.goals || []}
                        currency_str={currency_str}
                        onAddGoal={async (goal: Goal) => {
                          const res = await fetch("/api/goals", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(goal),
                          });

                          if (res.ok) {
                            updateFinanceLocal({
                              goals: [...(finance?.goals || []), goal],
                            });
                            toast.success("Goal added 🚀");
                          } else {
                            toast.error("Failed to add goal!");
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* TRANSACTIONS */}
            {loading ? (
              <TransactionsCardLoader />
            ) : (
              <GlassCard>
                <p className="text-sm font-medium text-white mb-3">
                  📄 Statement Transactions{" "}
                  {selectedStatementId && "(Selected)"}
                </p>

                {selectedTransactions.length > 0 ? (
                  <TransactionTable
                    transactions={selectedTransactions}
                    GlassCard={GlassCard}
                    currency_str={currency_str}
                  />
                ) : (
                  <p className="text-xs text-gray-500">
                    Select a statement to view transactions
                  </p>
                )}

                {/* ========================= */}
                {/* ✍️ MANUAL TRANSACTIONS */}
                {/* ========================= */}
                <div>
                  <p className="text-sm font-medium text-white mb-2 mt-10">
                    ✍️ Manual Transactions
                  </p>

                  <button
                    onClick={() => {
                      if (Number(income) <= 0) {
                        toast.error("Enter your monthly income amount first");
                      } else if (finance?.isDemo) {
                        toast.error(
                          "You're currently using demo data. Delete demo mode to add real transactions.",
                        );
                      } else {
                        setShowAddModal(true);
                      }
                    }}
                    className="text-xs text-gray-400 bg-green-600/20 px-3 py-1 rounded mb-5"
                  >
                    + Add Manual
                  </button>

                  {manualTransactions.length > 0 ? (
                    <TransactionTable
                      onDelete={deleteManualTransaction}
                      isDemo={finance?.isDemo}
                      isManual={true}
                      transactions={manualTransactions}
                      GlassCard={GlassCard}
                    />
                  ) : (
                    <p className="text-xs text-gray-600">
                      No manual transactions added yet
                    </p>
                  )}
                </div>
              </GlassCard>
            )}
          </div>

          {/* RIGHT: AI SUMMARY */}
          <div className={`space-y-4`}>
            {/* 🧠 AI ANALYSIS */}
            {loading ? (
              <AIAnalysisLoader />
            ) : (
              <AIAnalysis
                transactionsLength={allTransactions.length}
                income={income}
                totalIncome={totalIncome}
                totalSpent={totalSpent}
                latestAnalysis={latestAnalysis}
                downloadResult={downloadResult}
                setShowAddModal={setShowAddModal}
                setShowUpload={setShowUpload}
                currency_str={currency_str}
              />
            )}

            {/* 🔮 PREDICTION CARD */}
            {loading ? (
              <PredictionSectionLoader />
            ) : (
              <>
                {finance && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col justify-center items-start gap-2 w-full"
                  >
                    {/* 📊 CHART */}
                    <div className="lg:mt-4 flex-1 w-full">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <SpendingChart
                          transactionsLength={allTransactions.length}
                          breakdown={finance.breakdown}
                          currency_str={currency_str}
                        />
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      {allTransactions.length < 15 ? (
                        <GlassCard gradient>
                          <div className="space-y-4">
                            {/* HEADER */}
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-white">
                                🔮 Next Month Prediction
                              </p>

                              <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                Locked
                              </span>
                            </div>

                            {/* LOCKED CARD */}
                            <div className="p-5 rounded-xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-white/10 space-y-4">
                              {/* ICON + TEXT */}
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">🔒</div>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    Prediction Unavailable
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Not enough data to forecast future spending
                                  </p>
                                </div>
                              </div>

                              {/* PROGRESS */}
                              <div>
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                  <span>Data Progress</span>
                                  <span>{allTransactions.length}/15</span>
                                </div>

                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all"
                                    style={{
                                      width: `${Math.min(
                                        (allTransactions.length / 15) * 100,
                                        100,
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* INFO */}
                              <p className="text-[11px] text-gray-400 leading-relaxed">
                                AI predictions require consistent spending
                                history to detect trends and patterns.
                              </p>

                              {/* CTA */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (Number(income) <= 0) {
                                      toast.error(
                                        "Enter your monthly income amount first",
                                      );
                                    } else {
                                      setShowUpload(true);
                                    }
                                  }}
                                  className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                                >
                                  Upload Statement
                                </button>

                                <button
                                  onClick={() => {
                                    if (Number(income) <= 0) {
                                      toast.error(
                                        "Enter your monthly income amount first",
                                      );
                                    } else {
                                      setShowAddModal(true);
                                    }
                                  }}
                                  className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                                >
                                  Add Data
                                </button>
                              </div>

                              {/* TIP */}
                              <p className="text-[10px] text-gray-500">
                                Tip: 2–3 weeks of transactions improves
                                prediction accuracy
                              </p>
                            </div>
                          </div>
                        </GlassCard>
                      ) : (
                        <GlassCard>
                          <div className="space-y-4">
                            {/* HEADER */}
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-white">
                                🔮 Next Month Prediction
                              </p>

                              <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                AI Forecast
                              </span>
                            </div>

                            {/* VALUE */}
                            <div className="p-4 rounded-xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                              <motion.h2
                                key={
                                  simulationResult?.newSpent ??
                                  finance.prediction?.nextMonthExpense
                                }
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="text-lg font-semibold"
                              >
                                {currency_str}
                                {simulationResult?.newSpent ??
                                  finance.prediction?.nextMonthExpense ??
                                  0}
                              </motion.h2>

                              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                                {simulationResult?.message ||
                                  finance.prediction?.reason ||
                                  "Based on your recent spending patterns"}
                              </p>
                            </div>

                            {/* MINI INSIGHT */}
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Trend</span>
                              <span className="text-green-400">Stable</span>
                            </div>
                          </div>
                        </GlassCard>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>

        {/* UPLOAD */}
        <UploadStatement
          showUploadModal={showUpload}
          setShowUploadModal={setShowUpload}
          setSelectedStatementId={setSelectedStatementId}
        />
      </div>
    </div>
  );
}

/* COMPONENTS */

export function GlassCard({
  children,
  gradient,
  className,
}: {
  children: React.ReactNode;
  gradient?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`p-5 rounded-2xl border border-white/10 backdrop-blur-xl ${
        gradient
          ? "bg-linear-to-br from-blue-500/10 to-purple-500/10"
          : "bg-white/5 backdrop-blur"
      }${className}`}
    >
      {children}
    </div>
  );
}

function Card({
  title,
  value,
  red,
  green,
  className,
}: {
  title: string;
  value: string;
  red?: boolean;
  green?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`p-5 rounded-xl bg-white/5 border border-white/10 ${className}`}
    >
      <p className="text-xs text-gray-400">{title}</p>
      <p
        className={`text-lg font-semibold ${
          red ? "text-red-400" : green ? "text-green-400" : ""
        }`}
      >
        {value[0] + `${Number(value.slice(1)).toFixed(2)}`}
      </p>
    </div>
  );
}

/* --------------- LOADERS ------------------ */

const GamificationLoader = () => {
  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl animate-pulse space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-5 w-10 bg-white/10 rounded-lg" />
      </div>

      {/* XP BAR */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-10 bg-white/10 rounded" />
          <div className="h-3 w-20 bg-white/10 rounded" />
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* STREAK */}
      <div className="flex justify-between items-center">
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
      </div>

      {/* ACHIEVEMENTS */}
      <div className="space-y-3">
        <div className="h-3 w-24 bg-white/10 rounded" />

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-20 bg-white/10 rounded-full" />
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-white/10">
        <div className="h-3 w-full bg-white/10 rounded" />
      </div>
    </div>
  );
};

const LifeImpactCardLoader = () => {
  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl animate-pulse space-y-4">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-3 w-48 bg-white/10 rounded" />
      </div>

      {/* STABILITY */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-3 w-10 bg-white/10 rounded" />
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Survival */}
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="h-3 w-20 bg-white/10 rounded" />
          <div className="h-5 w-12 bg-white/10 rounded" />
          <div className="h-3 w-28 bg-white/10 rounded" />
        </div>

        {/* Stress */}
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="h-3 w-20 bg-white/10 rounded" />
          <div className="h-5 w-14 bg-white/10 rounded" />
          <div className="h-3 w-28 bg-white/10 rounded" />
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="h-3 w-full bg-white/10 rounded" />
      </div>
    </div>
  );
};

function TransactionsCardLoader() {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5 animate-pulse">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="h-4 w-48 bg-white/10 rounded" />
        <div className="h-3 w-32 bg-white/10 rounded" />
      </div>

      {/* TABLE SKELETON */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/10 rounded" />
              <div className="h-2 w-20 bg-white/10 rounded" />
            </div>

            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* MANUAL SECTION HEADER */}
      <div className="space-y-2 pt-2">
        <div className="h-4 w-40 bg-white/10 rounded" />
        <div className="h-6 w-28 bg-white/10 rounded-lg" />
      </div>

      {/* MANUAL TABLE */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="space-y-2">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="h-2 w-16 bg-white/10 rounded" />
            </div>

            <div className="h-3 w-14 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatementsGoalsLoader() {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full animate-pulse">
      {/* 📄 STATEMENTS LOADER */}
      <div className="flex-1 w-full">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-6 w-20 bg-white/10 rounded-lg" />
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-full bg-white/5 border border-white/10 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 GOALS LOADER */}
      <div className="flex-1 w-full">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-white/10 rounded" />
            <div className="h-6 w-20 bg-white/10 rounded-lg" />
          </div>

          {/* GOAL ITEMS */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3"
              >
                {/* TITLE + STATUS */}
                <div className="flex justify-between items-center">
                  <div className="h-3 w-32 bg-white/10 rounded" />
                  <div className="h-4 w-16 bg-white/10 rounded-full" />
                </div>

                {/* AMOUNT */}
                <div className="h-2 w-40 bg-white/10 rounded" />

                {/* PROGRESS BAR */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-white/10 rounded-full" />
                </div>

                {/* PERCENT */}
                <div className="h-2 w-10 ml-auto bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function AIAnalysisLoader() {
  return (
    <div className="animate-pulse">
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="h-4 w-44 bg-white/10 rounded" />
          <div className="h-5 w-20 bg-white/10 rounded-full" />
        </div>

        {/* SUMMARY */}
        <div className="flex flex-wrap gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
            >
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-5 w-32 bg-white/10 rounded" />
            </div>
          ))}

          {/* DESKTOP IMPACT BLOCK */}
          <div className="hidden md:block flex-1 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="h-3 w-36 bg-white/10 rounded" />
            <div className="h-5 w-28 bg-white/10 rounded" />
            <div className="h-2 w-24 bg-white/10 rounded" />
          </div>
        </div>

        {/* SCORE HERO */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10" />
        </div>

        {/* INSIGHTS + ACTION */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* INSIGHTS */}
          <div className="flex-1 space-y-3">
            <div className="h-3 w-24 bg-white/10 rounded" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2"
              >
                <div className="h-2 w-full bg-white/10 rounded" />
                <div className="h-2 w-4/5 bg-white/10 rounded" />
              </div>
            ))}
          </div>

          {/* ACTION PLAN */}
          <div className="flex-1 space-y-3">
            <div className="h-3 w-24 bg-white/10 rounded" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-white/10" />
                <div className="h-2 w-full bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE IMPACT */}
        <div className="block md:hidden p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="h-3 w-36 bg-white/10 rounded" />
          <div className="h-5 w-28 bg-white/10 rounded" />
          <div className="h-2 w-24 bg-white/10 rounded" />
        </div>

        {/* BUTTON */}
        <div className="h-9 w-full bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}

function PredictionSectionLoader() {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse">
      {/* 📊 CHART LOADER */}
      <div className="w-full">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
          {/* HEADER */}
          <div className="space-y-2">
            <div className="h-4 w-40 bg-white/10 rounded" />
            <div className="h-3 w-28 bg-white/10 rounded" />
          </div>

          {/* CHART AREA */}
          <div className="w-full h-52 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/10" />
              <div className="h-2 w-24 bg-white/10 rounded" />
            </div>
          </div>

          {/* LEGEND */}
          <div className="space-y-2">
            <div className="h-2 w-32 bg-white/10 rounded" />
            <div className="h-2 w-28 bg-white/10 rounded" />
            <div className="h-2 w-24 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      {/* 🔮 PREDICTION CARD LOADER */}
      <div className="w-full">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="h-4 w-44 bg-white/10 rounded" />
            <div className="h-5 w-20 bg-white/10 rounded-full" />
          </div>

          {/* VALUE BLOCK */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="h-6 w-32 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-4/5 bg-white/10 rounded" />
          </div>

          {/* MINI INSIGHT */}
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
