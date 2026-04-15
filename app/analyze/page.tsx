"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Target, TrendingDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion, number } from "framer-motion";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionTable from "@/components/TransactionTable";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ScoreCard from "@/components/ScoreCard";
import NotFound from "../not-found";
import UploadStatement from "@/components/UploadStatement";
import { sectionColors } from "@/lib/sectionColors";

import { useFinance } from "@/hooks/useFinance";
import SpendingChart from "@/components/SpendingCharts";

type Transaction = {
  amount: number;
  category: string;
  type: "Income" | "Expense";
  mode: string;
  date: string;
};

export default function Analyze() {
  const { data: session } = useSession();
  const { finance, statements: fianceStatements } = useFinance();
  const latestAnalysis = finance?.aiHistory?.at(-1);

  const [simulateValue, setSimulateValue] = useState(0);
  const [simulatedExpense, setSimulatedExpense] = useState<number | null>(null);
  const [html2pdfInstance, setHtml2pdfInstance] = useState<any>(null);

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
    // Dynamically import html2pdf.js on client
    import("html2pdf.js").then((mod) => {
      setHtml2pdfInstance(() => mod.default);
    });
  }, []);

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
    if (!income || Number(income) === 0 || Number(income) < 0) {
      toast.error("Invalid income input!");
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: Number(income),
        }),
      });
    }, 800); // wait 800 ms
  };

  const simulate = () => {
    if (!finance?.prediction?.nextMonthExpense) return;

    const newExpense = finance.prediction.nextMonthExpense - simulateValue;

    setSimulatedExpense(newExpense);
    toast.success("Future updated based on your decision 🚀");
  };

  const downloadResult = () => {
    if (!html2pdfInstance || !latestAnalysis) {
      alert("Can't download result! Try again.");
      return;
    }

    // 🔹 reusable section
    const section = (title: string, content: string) => `
      <div style="margin-bottom:18px;">
        <div style="
          font-size:11px;
          color:#6b7280;
          font-weight:600;
          margin-bottom:6px;
          letter-spacing:0.5px;
          text-transform:uppercase;
        ">
          ${title}
        </div>
        <div style="font-size:14px; color:#111827;">
          ${content || "-"}
        </div>
      </div>
    `;

    const element = document.createElement("div");

    element.innerHTML = `
      <div style="
        font-family: Inter, Arial, sans-serif;
        padding: 40px;
        color: #111827;
        line-height: 1.6;
      ">

        <!-- HEADER -->
        <div style="margin-bottom:20px;">
          <h1 style="font-size:24px; margin:0;">
            MoneyMind Report
          </h1>

          <div style="
            font-size:13px;
            color:#6b7280;
            margin-top:4px;
          ">
            AI-powered financial behavior analysis
          </div>

          <div style="
            margin-top:12px;
            font-size:16px;
            font-weight:600;
            color:#2563eb;
          ">
            Score: ${latestAnalysis?.score ?? 0} / 100
          </div>
        </div>

        <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />

        <!-- CONTENT -->
        ${section("Personality", latestAnalysis?.personality)}
        ${section(
          "Key Insights",
          latestAnalysis?.insights?.map(
            (i: { text: string; type: string }) => i.text,
          ),
        )}
        ${section("Action Plan", latestAnalysis?.fixes?.map((f: { action: string; priority: string }) => f.action).join(", "))}
        ${section("Financial Impact", latestAnalysis?.impact)}

        <!-- FOOTER -->
        <div style="
          margin-top:40px;
          font-size:10px;
          color:#9ca3af;
        ">
          Generated by MoneyMind • Behavioral Finance AI
        </div>

      </div>
    `;

    html2pdfInstance()
      .set({
        margin: 0,
        filename: "MoneyMind-Report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(element)
      .save();
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

  if (!session) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen h-auto bg-black text-white px-3 md:p-6">
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
                setManualTransactions(data.transactions);
                toast.success("Transaction added 🚀");
              } else {
                toast.error("Failed to add transaction");
              }
            }}
          />
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard>
            <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
            <input
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              onBlur={changeMonthlyIncome}
              placeholder="₹25000"
              className="w-full p-3 text-base md:text-sm rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </GlassCard>
          <Card title="Spent" value={`₹${totalSpent}`} />
          <Card title="Balance" value={`₹${totalIncome - totalSpent}`} />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: STATEMENTS */}
          <div className="space-y-4">
            <GlassCard>
              <div className="flex justify-between mb-3">
                <p className="text-sm text-gray-400">Statements</p>

                <button
                  onClick={() => setShowUpload(true)}
                  className="text-xs bg-purple-500/20 px-3 py-1 rounded"
                >
                  Upload
                </button>
              </div>

              {statements.length === 0 ? (
                <p className="text-xs text-gray-500">No statements uploaded</p>
              ) : (
                <div className="space-y-2">
                  {statements.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => setSelectedStatementId(s._id)}
                      className={`p-2 rounded cursor-pointer text-xs ${
                        selectedStatementId === s._id
                          ? "bg-blue-500/20"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      📄 {s.fileName}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* TRANSACTIONS */}
            <GlassCard>
              <p className="text-sm text-gray-400 mb-3">
                Transactions {selectedStatementId && "(Selected Statement)"}
              </p>

              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs bg-green-500/20 px-3 py-1 rounded"
              >
                + Add Manual
              </button>

              {selectedTransactions.length > 0 ? (
                <TransactionTable
                  transactions={selectedTransactions}
                  GlassCard={GlassCard}
                />
              ) : (
                <p className="text-xs text-gray-500">
                  Select a statement to view transactions
                </p>
              )}
            </GlassCard>
          </div>

          {/* RIGHT: AI SUMMARY */}
          <div className="space-y-4">
            {/* 🧠 AI ANALYSIS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard>
                <p className="text-sm text-gray-400 mb-3">
                  🧠 AI Analysis (All Statements)
                </p>

                {allTransactions.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Upload statements to see analysis
                  </p>
                ) : (
                  <div className="text-sm space-y-2">
                    {/* 💸 TOTALS */}
                    <div className="flex justify-between">
                      <p>💸 Spent</p>
                      <span>₹{totalSpent}</span>
                    </div>

                    <div className="flex justify-between">
                      <p>💰 Income</p>
                      <span>₹{totalIncome}</span>
                    </div>

                    {latestAnalysis ? (
                      <motion.div
                        key={latestAnalysis.createdAt}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 space-y-3 text-sm"
                      >
                        {/* 🎯 SCORE */}
                        <div className="flex justify-between items-center">
                          <p className="text-gray-400 text-xs">
                            Financial Score
                          </p>

                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`font-semibold ${scoreColor}`}
                          >
                            {latestAnalysis?.score ?? 0}/100
                          </motion.span>
                        </div>

                        {/* 🧠 PERSONALITY */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-blue-400"
                        >
                          🧠 {latestAnalysis?.personality}
                        </motion.div>

                        {/* 💡 INSIGHTS */}
                        <div className="space-y-1">
                          {latestAnalysis?.insights
                            ?.slice(0, 2)
                            .map((ins: any, i: number) => (
                              <motion.p
                                key={i}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-xs text-gray-300"
                              >
                                • {ins.text}
                              </motion.p>
                            ))}
                        </div>

                        {/* ⚡ FIX */}
                        {latestAnalysis.fixes?.[0] && (
                          <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="bg-blue-500/10 border border-blue-500/20 p-2 rounded text-xs"
                          >
                            👉 {latestAnalysis.fixes[0].action}
                          </motion.div>
                        )}

                        {/* 📊 IMPACT */}
                        {latestAnalysis.impact && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[11px] text-green-400"
                          >
                            💰 Save ₹{latestAnalysis.impact.savingsPotential}{" "}
                            possible
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        AI analysis will appear after processing
                      </p>
                    )}
                    <button onClick={downloadResult}>download</button>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* 🔮 PREDICTION CARD */}
            {finance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard>
                  <p className="text-sm text-gray-400 mb-2">
                    🔮 Next Month Prediction
                  </p>

                  <motion.h2
                    key={
                      simulatedExpense ?? finance.prediction?.nextMonthExpense
                    }
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold"
                  >
                    ₹
                    {simulatedExpense ??
                      finance.prediction?.nextMonthExpense ??
                      0}
                  </motion.h2>

                  <p className="text-xs text-gray-400 mt-1">
                    {finance.prediction?.reason ||
                      "Based on your recent spending habits"}
                  </p>
                </GlassCard>

                {/* 📊 CHART */}
                <p className="text-gray-400 text-sm mb-2">
                  Your spending behavior this month
                </p>
                <SpendingChart breakdown={finance.breakdown} />
              </motion.div>
            )}

            {/* 🎮 SIMULATION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <p className="text-sm text-gray-400 mb-2">
                  🎮 Simulate Improvement
                </p>

                <input
                  type="number"
                  placeholder="Reduce by ₹5000"
                  onChange={(e) => setSimulateValue(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
                />

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={simulate}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                >
                  Simulate
                </motion.button>

                {simulatedExpense !== null && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-xs mt-2"
                  >
                    You can save ₹{simulateValue} next month 🎉
                  </motion.p>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>

        {/* UPLOAD */}
        <UploadStatement
          showUploadModal={showUpload}
          setShowUploadModal={setShowUpload}
          setTransactions={setManualTransactions}
        />
      </div>
    </div>
  );
}

/* COMPONENTS */

function GlassCard({
  children,
  gradient,
}: {
  children: React.ReactNode;
  gradient?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-2xl border border-white/10 backdrop-blur-xl ${
        gradient
          ? "bg-linear-to-br from-green-500/10 to-blue-500/10"
          : "bg-white/5"
      }`}
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
}: {
  title: string;
  value: string;
  red?: boolean;
  green?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-xs text-gray-400">{title}</p>
      <p
        className={`text-lg font-semibold ${
          red ? "text-red-400" : green ? "text-green-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
