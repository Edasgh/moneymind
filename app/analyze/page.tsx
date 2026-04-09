/*
I want my analyze page to show the names of statements & on clicking those names only -> show transactions
And AI Analysis should be done considering the transactions in all of the statements

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Target, TrendingDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionTable from "@/components/TransactionTable";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ScoreCard from "@/components/ScoreCard";
import NotFound from "../not-found";
import UploadStatement from "@/components/UploadStatement";

export const sectionColors = {
  personality: {
    title: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
  },
  insight: {
    title: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
  },
  fixes: {
    title: "text-yellow-400",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
  },
  impact: {
    title: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
  },
};

export default function Analyze() {
  const { data: session } = useSession();

  const [income, setIncome] = useState("0");
  const [transactions, setTransactions] = useState<
    {
      date: string;
      mode: string;
      category: string;
      amount: string;
      type: "Income" | "Expense";
    }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [html2pdfInstance, setHtml2pdfInstance] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [harshMode, setHarshMode] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<{
    personality: string;
    insight: string;
    fix: string;
    impact: string;
  } | null>({
    personality: "You tend to spend impulsively on non-essential items.",
    insight: "60% of your expenses come from food & entertainment.",
    fix: "Try setting a weekly spending limit of ₹2000.",
    impact: "You could save ₹5000/month with small adjustments",
  });

  const [summary, setSummary] = useState({
    essential: 0,
    lifestyle: 0,
    impulsive: 0,
  });

  const router = useRouter();

  const [goals, setGoals] = useState<any[]>([]);
  const [goalInput, setGoalInput] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const [affordInput, setAffordInput] = useState("");
  const [affordResult, setAffordResult] = useState("");
  const [aiGoalResult, setAiGoalResult] = useState("");

  const totalSpent = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalAmount =
    Number(income) +
    transactions
      .filter((t) => t.type === "Income")
      .reduce((acc, t) => acc + Number(t.amount), 0);

  // ADD GOAL
  const addGoal = () => {
    if (!goalInput || !goalAmount) return;
    setGoals([...goals, { title: goalInput, target: goalAmount, saved: 0 }]);
    setGoalInput("");
    setGoalAmount("");
  };

  // AFFORD CHECK (dummy logic)
  const checkAfford = () => {
    const remaining = Number(income) - totalSpent;
    if (remaining >= Number(affordInput)) {
      setAffordResult("✅ You can afford this 🎉");
    } else {
      setAffordResult("⚠️ Not affordable yet. Keep saving.");
    }
  };

  const handleAskAI = (goal: any) => {
    const remaining = Number(income) - totalSpent;

    if (remaining >= goal.target) {
      setAiGoalResult(`✅ You can afford ${goal.title} now 🎉`);
    } else {
      const months = Math.ceil(goal.target / (remaining || 1));

      setAiGoalResult(
        `You cannot afford ${goal.title} yet.\n\n💡 At your current savings rate, you can afford it in ~${months} months.`,
      );
    }
  };

  const copyResult = () => {
    if (!result) {
      toast.error("Can't copy result! Please try again later.");
      return;
    }
    const text = `🧠 My MoneyMind Result:

          ${result.personality}

          💡 Insight: ${result.insight}
          ⚡ Fix: ${result.fix}
          💰 Impact: ${result.impact}

          Try it yourself! 🚀`;

    navigator.clipboard.writeText(text);
    toast.success("Result Copied!");
  };

  useEffect(() => {
    // Dynamically import html2pdf.js on client
    import("html2pdf.js").then((mod) => {
      setHtml2pdfInstance(() => mod.default);
    });
  }, []);

  // helper
  const section = (title: string, content: string) => `
    <div style="margin-bottom:20px;">
      <div style="
        font-size:12px;
        color:#888;
        font-weight:bold;
        margin-bottom:5px;
        text-transform:uppercase;
      ">
        ${title}
      </div>
      <div>${content}</div>
    </div>
  `;

  const downloadResult = () => {
    if (!html2pdfInstance || !result) {
      toast.error("Can't download result! Please try again later.");
      return;
    }

    const element = document.createElement("div");

    element.innerHTML = `
      <div style="
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #111;
        line-height: 1.6;
      ">
        <div>
          <h1 style="font-size:26px; margin-bottom:5px;">
            MoneyMind Report
            <span style="
              float:right;
              font-size:16px;
              color:#2563eb;
              font-weight:bold;
            ">
              Score: ${score} / 100
            </span>
          </h1>
          <div style="color:#666; font-size:13px; margin-bottom:20px;">
            Your financial behavior analysis
          </div>
        </div>

        <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />

        ${section("Personality", result.personality)}
        ${section("Insight", result.insight)}
        ${section("Action Plan", result.fix)}
        ${section("Impact", result.impact)}

        <div style="
          margin-top:40px;
          font-size:10px;
          color:#999;
        ">
          Generated by MoneyMind • Behavioral Finance AI
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: "MoneyMind-Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    } as const;

    html2pdfInstance().set(opt).from(element).save();
  };

  const iColor = sectionColors.insight;
  const fColor = sectionColors.fixes;
  const imColor = sectionColors.impact;

  if (!session) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-black text-white px-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
       
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-blue-500/10 blur-[120px]" />
        </div>

     
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
                  className="text-xs text-red-400"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-3 gap-4">
            <Card title="Income" value={`₹${income || 0}`} />
            <Card title="Spent" value={`₹${totalSpent}`} red />
            <Card title="Left" value={`₹${totalAmount - totalSpent}`} green />
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            <div className="space-y-6">
              
              <GlassCard>
                <p className="text-sm text-gray-400 mb-2">Monthly Income</p>
                <input
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="₹25000"
                  className="w-full p-3 text-sm rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </GlassCard>

              
              <GlassCard>
                <div className="flex justify-between mb-4">
                  <p className="text-sm text-gray-400">Transactions</p>
                  <div className="flex justify-center items-center gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUpload(true)}
                        className="text-xs bg-purple-500/20 px-3 py-1 rounded-lg"
                      >
                        Upload
                      </button>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="text-xs bg-blue-500/20 px-3 py-1 rounded-lg"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                
                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <TransactionTable
                      transactions={transactions}
                      GlassCard={GlassCard}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    No transactions added yet.
                  </p>
                )}
              </GlassCard>
            </div>

            
            <div className="space-y-6">
              
              <GlassCard>
                <div className="flex flex-row flex-wrap justify-between gap-2 mt-3">
                  <p className="text-sm text-gray-400">Goals</p>

                  <button
                    onClick={() => setShowGoals(true)}
                    className="text-xs bg-purple-500/20 px-3 py-1 rounded-lg"
                  >
                    View All
                  </button>
                </div>

                {goals.length === 0 ? (
                  <p className="text-xs text-gray-500">No goals added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {goals.slice(0, 2).map((g, i) => (
                      <div
                        key={i}
                        onClick={() => handleAskAI(g)}
                        className="text-xs flex justify-between p-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
                      >
                        <span>{g.title}</span>
                        <span>₹{g.target}</span>
                      </div>
                    ))}
                  </div>
                )}

                
                <div className="flex gap-2 mt-3">
                  <input
                    placeholder="Goal"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-full flex-2 p-3 text-sm rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    placeholder="₹"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="w-full flex-1 p-3 text-sm rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={addGoal}
                    className="bg-purple-500 px-3 rounded text-xs"
                  >
                    Add
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>

          
          {transactions.length > 0 && (
            <GlassCard>
              <p className="text-sm text-gray-400 mb-4">
                🧠 Financial Analysis
              </p>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-4 md:p-6 space-y-4 md:space-y-5 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl shadow-xl"
                >
                  <ScoreCard result={result} score={score} />

                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                      className={`p-4 rounded-xl border ${iColor.border} ${iColor.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className={`w-4 h-4 ${iColor.title}`} />
                        <p className={`text-sm ${iColor.title}`}>INSIGHT</p>
                      </div>

                      <p className="text-gray-300 leading-relaxed">
                        {result.insight}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                      className={`p-4 rounded-xl border ${fColor.border} ${fColor.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Target className={`w-4 h-4 ${fColor.title}`} />
                        <p className={`text-sm ${fColor.title}`}>ACTION PLAN</p>
                      </div>

                      <ul className="list-disc ml-5 space-y-2 text-gray-300">
                        {result.fix
                          .split(/\.\s+/)
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                      className={`p-4 rounded-xl border ${imColor.border} ${imColor.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className={`w-4 h-4 ${imColor.title}`} />
                        <p className={`text-sm ${imColor.title}`}>IMPACT</p>
                      </div>

                      <p className="text-gray-300 leading-relaxed">
                        {result.impact}
                      </p>
                    </motion.div>
                  </div>

                  <button
                    onClick={copyResult}
                    className="absolute right-12 text-xl top-1 cursor-pointer group"
                  >
                    🖥
                    <span
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                whitespace-nowrap bg-gray-700 text-white text-xs px-2 py-1 rounded
                opacity-0 group-hover:opacity-100 transition"
                    >
                      Copy
                    </span>
                  </button>
                  <button
                    onClick={downloadResult}
                    className="absolute right-3 top-1 text-xl cursor-pointer group"
                  >
                    ⬇️
                    <span
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                whitespace-nowrap bg-gray-700 text-white text-xs px-2 py-1 rounded
                opacity-0 group-hover:opacity-100 transition"
                    >
                      Download PDF
                    </span>
                  </button>
                </motion.div>
              )}
            </GlassCard>
          )}
        </div>

        
        {aiGoalResult && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-999999999">
            <div className="bg-black border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg">🤖 AI Insight</h2>
                <button onClick={() => setAiGoalResult("")}>✕</button>
              </div>

              <p className="text-sm text-gray-300 whitespace-pre-line">
                {aiGoalResult}
              </p>
            </div>
          </div>
        )}

        
        {showGoals && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
            <div className="bg-black border border-white/10 rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg">Your Goals</h2>
                <button onClick={() => setShowGoals(false)}>✕</button>
              </div>

              <div className="space-y-4">
                {goals.length > 0 ? (
                  <>
                    {goals.map((g, i) => {
                      const progress = (g.saved / g.target) * 100;

                      return (
                        <div
                          key={i}
                          onClick={() => handleAskAI(g)}
                          className="bg-white/5 p-3 rounded-lg"
                        >
                          <div className="flex justify-between mb-1">
                            <span>{g.title}</span>
                            <span className="text-xs">
                              ₹{g.saved}/{g.target}
                            </span>
                          </div>

                          <div className="h-2 bg-white/10 rounded">
                            <div
                              className="h-2 bg-linear-to-r from-blue-500 to-purple-500 rounded"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-xs text-gray-500">No goals added yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        
        {showModal && (
          <AddTransactionModal
            onAdd={(form: {
              date: string;
              mode: string;
              category: string;
              amount: string;
              type: "Income" | "Expense";
            }) => {
              const newTransaction = form;
              setTransactions((prev) => [...prev, newTransaction]);
            }}
            onClose={() => {
              setShowModal(false);
            }}
          />
        )}

        
        <UploadStatement
          showUploadModal={showUpload}
          setShowUploadModal={setShowUpload}
          setTransactions={setTransactions}
          setSummary={setSummary}
        />

       
        <Link
          href="/chat"
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-linear-to-r from-blue-500 to-purple-500 p-3 md:p-4 rounded-full shadow-xl"
        >
          🤖
        </Link>
      </div>
    </div>
  );
}

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
  */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Target, TrendingDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionTable from "@/components/TransactionTable";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ScoreCard from "@/components/ScoreCard";
import NotFound from "../not-found";
import UploadStatement from "@/components/UploadStatement";

export const sectionColors = {
  personality: {
    title: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
  },
  insight: {
    title: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
  },
  fixes: {
    title: "text-yellow-400",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
  },
  impact: {
    title: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
  },
};

export default function Analyze() {
  const { data: session } = useSession();
  const [html2pdfInstance, setHtml2pdfInstance] = useState<any>(null);
  const router = useRouter();

  const [income,setIncome] = useState("0");

  // ✅ Manual transactions
  const [manualTransactions, setManualTransactions] = useState<any[]>([]);

  // ✅ Statements
  const [statements, setStatements] = useState<
    {
      _id: string;
      fileName: string;
      transactions: any[];
    }[]
  >([]);

  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(
    null,
  );
  const [showUpload, setShowUpload] = useState(false);

  // =========================
  // 🧠 ALL TRANSACTIONS (AI USES THIS)
  // =========================
  const allTransactions = [
    ...manualTransactions,
    ...statements.flatMap((s) => s.transactions),
  ];

  // =========================
  // 📄 SELECTED STATEMENT DATA
  // =========================
  const selectedTransactions =
    statements.find((s) => s._id === selectedStatementId)?.transactions || [];

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
  }, [])

  // TODO : change monthly income on mouse out
  const changeMonthlyIncome = async()=>{
    const res = await fetch("/api/profile",{
      method:"PATCH",
      body:JSON.stringify({
        financeId:"",
        monthlyIncome:Number(income)
      })
    })
  }

  // helper
  const section = (title: string, content: string) => `
    <div style="margin-bottom:20px;">
      <div style="
        font-size:12px;
        color:#888;
        font-weight:bold;
        margin-bottom:5px;
        text-transform:uppercase;
      ">
        ${title}
      </div>
      <div>${content}</div>
    </div>
  `;

  // const downloadResult = () => {
  //   if (!html2pdfInstance || !result) {
  //     toast.error("Can't download result! Please try again later.");
  //     return;
  //   }

  //   const element = document.createElement("div");

  //   element.innerHTML = `
  //     <div style="
  //       font-family: Arial, sans-serif;
  //       padding: 40px;
  //       color: #111;
  //       line-height: 1.6;
  //     ">
  //       <div>
  //         <h1 style="font-size:26px; margin-bottom:5px;">
  //           MoneyMind Report
  //           <span style="
  //             float:right;
  //             font-size:16px;
  //             color:#2563eb;
  //             font-weight:bold;
  //           ">
  //             Score: ${score} / 100
  //           </span>
  //         </h1>
  //         <div style="color:#666; font-size:13px; margin-bottom:20px;">
  //           Your financial behavior analysis
  //         </div>
  //       </div>

  //       <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />

  //       ${section("Personality", result.personality)}
  //       ${section("Insight", result.insight)}
  //       ${section("Action Plan", result.fix)}
  //       ${section("Impact", result.impact)}

  //       <div style="
  //         margin-top:40px;
  //         font-size:10px;
  //         color:#999;
  //       ">
  //         Generated by MoneyMind • Behavioral Finance AI
  //       </div>
  //     </div>
  //   `;

  //   const opt = {
  //     margin: 0,
  //     filename: "MoneyMind-Report.pdf",
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  //   } as const;

  //   html2pdfInstance().set(opt).from(element).save();
  // };

  const iColor = sectionColors.insight;
  const fColor = sectionColors.fixes;
  const imColor = sectionColors.impact;

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

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard>
            <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
            <input
              value={income}
              onChange={(e) => setIncome(e.target.value)}
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
                  <p>💸 Total Spent: ₹{totalSpent}</p>
                  <p>💰 Total Income: ₹{totalIncome}</p>

                  <p className="text-gray-400 text-xs mt-2">
                    (AI will use all uploaded data)
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* UPLOAD */}
        <UploadStatement
          showUploadModal={showUpload}
          setShowUploadModal={setShowUpload}
          setTransactions={setManualTransactions}
        />

        {/* FLOATING AI */}
        <Link
          href="/chat"
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-linear-to-r from-blue-500 to-purple-500 p-3 md:p-4 rounded-full shadow-xl"
        >
          🤖
        </Link>
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
