"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import {
  ArrowRight,
  Lightbulb,
  Target,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
} from "lucide-react";
import ScoreCard from "../components/ScoreCard";

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

export default function AnalyzePage() {
  const [spending, setSpending] = useState("");
  const [problem, setProblem] = useState("");
  const [income, setIncome] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [streamText, setStreamText] = useState(""); // for live typing
  const [result, setResult] = useState<{
    personality: string;
    insight: string;
    fix: string;
    impact: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [harshMode, setHarshMode] = useState(false);

  // Fallback: categorize spending based on all inputs
  const fallbackCategorizeSpending = ({
    spending,
    problem,
    income,
  }: {
    spending: string;
    problem: string;
    income: string;
  }) => {
    const text = spending.toLowerCase();
    const prob = problem.toLowerCase();
    const inc = Number(income);

    // Base category from spending
    let category: "essential" | "lifestyle" | "impulsive" = "lifestyle";

    if (/rent|food|bills|groceries|education|medical/.test(text))
      category = "essential";
    else if (
      /shopping|clothes|books|gym|travel|subscriptions|amazon|netflix|makeup/.test(
        text,
      )
    )
      category = "lifestyle";
    else if (/zomato|swiggy|fast food|luxury|party|alcohol|gambling/.test(text))
      category = "impulsive";

    // Adjust category based on problem awareness
    if (
      category === "lifestyle" &&
      /debt|overspending|loan|no savings/.test(prob)
    ) {
      category = "impulsive"; // bad habits escalate risk
    }

    // Adjust category based on very low income
    if (category !== "essential" && inc <= 10000) {
      category = "impulsive"; // risky if income is too low
    }

    return category;
  };

  // Fallback: calculate score out of 100 based on spending, problem, income
  const fallbackCalculateScore = ({
    spending,
    problem,
    income,
  }: {
    spending: string;
    problem: string;
    income: string;
  }) => {
    let score = 0;
    const spend = spending.toLowerCase();
    const prob = problem.toLowerCase();
    const inc = Number(income);

    // -------------------------
    // 1️⃣ Spending (0–40)
    // -------------------------
    if (/rent|food|bills|groceries|education|medical/.test(spend)) score += 35;
    else if (
      /shopping|clothes|books|gym|travel|subscriptions|amazon|netflix|makeup/.test(
        spend,
      )
    )
      score += 25;
    else if (
      /zomato|swiggy|fast food|luxury|party|alcohol|gambling/.test(spend)
    )
      score += 10;
    else score += 20; // neutral

    // -------------------------
    // 2️⃣ Problem Awareness (0–30)
    // -------------------------
    if (/debt|overspending|loan|no savings/.test(prob))
      score += 10; // low awareness, bad
    else if (/saving|budget|expenses/.test(prob))
      score += 20; // medium awareness
    else score += 15; // neutral

    // -------------------------
    // 3️⃣ Income (0–30)
    // -------------------------
    if (!inc || inc <= 0) score += 5;
    else if (inc > 50000) score += 30;
    else if (inc > 20000) score += 20;
    else score += 15;

    return Math.min(Math.round(score), 100);
  };

  const analyzeSpending = async (
    spending: string,
    income: string,
    problem: string,
  ) => {
    setLoading(true);
    setStreamText("");
    setStreamText("Analyzing spending behaviour...\n");

    setTimeout(() => {
      setStreamText((prev) => prev + "Classifying behavior...\n");
    }, 700);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        body: JSON.stringify({ spending, income, problem }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      let finalScore = 0;
      let finalCategory: string | null = null;
      if (!data || data.category === "unknown") {
        finalScore = 0;
        finalCategory = null;
      } else {
        // console.log("data from analyseSpending : ",data);

        // Normalize score to percentage
        // Maximum possible score per item is 8 (essential)
      
        finalScore = data.score > 100 ? 100 : data.score;
        finalCategory = data.category;
      }

      setScore(finalScore);
      setCategory(finalCategory);
    } catch (error) {
      console.log("Error in analyze spending : ", error);
      // Fallback
      const finalCategory = fallbackCategorizeSpending({
        spending,
        problem,
        income,
      });
      const finalScore = fallbackCalculateScore({ spending, problem, income });

      setScore(finalScore);
      setCategory(finalCategory);
    }
  };

  // Fallback : generate personality based on category & score
  const getPersonality = (
    score: number,
    category: string | null,
    harshMode: boolean,
  ): string => {
    // Clamp score between 0–100
    const s = Math.max(0, Math.min(score, 100));

    let message = "";

    if (category === "essential") {
      if (s >= 85)
        message =
          "💎 Financial Pro — Your essential spending is perfectly balanced!";
      else if (s >= 70)
        message =
          "⚖️ Balanced Spender — You prioritize essentials well, minor indulgences ok.";
      else if (s >= 50)
        message = harshMode
          ? "⚠️ Risky Spender — Even essential spending could use more discipline!"
          : "💰 Careless Spender — Essentials managed, but watch other habits.";
      else if (s >= 30)
        message = harshMode
          ? "🔥 Impulse Spender — Poor control over necessary expenses!"
          : "💸 Impulse Spender — Essential spending inconsistent, be careful!";
      else
        message = harshMode
          ? "🚨 Financial Disaster — Essential expenses are a mess!"
          : "😱 Chaotic Spender — Essentials neglected, urgent improvement needed!";
    } else if (category === "lifestyle") {
      if (s >= 85)
        message =
          "💎 Financial Pro — Lifestyle spending is smart and controlled!";
      else if (s >= 70)
        message =
          "⚖️ Balanced Spender — You enjoy life moderately without overspending.";
      else if (s >= 50)
        message = harshMode
          ? "⚠️ Risky Spender — Lifestyle indulgences may hurt your wallet!"
          : "💰 Careless Spender — You sometimes overspend on lifestyle items.";
      else if (s >= 30)
        message = harshMode
          ? "🔥 Impulse Spender — Lifestyle purchases are uncontrolled!"
          : "💸 Impulse Spender — Frequent lifestyle overspending detected.";
      else
        message = harshMode
          ? "🚨 Financial Disaster — Lifestyle spending is reckless!"
          : "😱 Chaotic Spender — Major overspending on lifestyle, beware!";
    } else if (category === "impulsive") {
      if (s >= 85)
        message =
          "💎 Financial Pro — Rare for impulsive spenders, excellent control!";
      else if (s >= 70)
        message =
          "⚖️ Balanced Spender — Impulsive habits exist, but you mostly control them.";
      else if (s >= 50)
        message = harshMode
          ? "⚠️ Risky Spender — Impulsive spending is risky, tighten control!"
          : "💰 Careless Spender — You often spend impulsively, work on discipline.";
      else if (s >= 30)
        message = harshMode
          ? "🔥 Impulse Spender — Brutal truth: impulsive spending dominates your finances!"
          : "💸 Impulse Spender — Impulse buys frequently hurt your budget.";
      else
        message = harshMode
          ? "🚨 Financial Disaster — Uncontrolled impulse spending everywhere!"
          : "😱 Chaotic Spender — Impulsive habits are high-risk, take action!";
    }

    return message;
  };

  const handleAnalyze = async () => {
    if (
      spending.trim().length === 0 ||
      problem.trim().length === 0 ||
      income.trim().length === 0
    ) {
      toast.error("Please fill all the fields!");
      return;
    }

    await analyzeSpending(spending, income, problem);

    setLoading(true);
    setResult(null);
    setStreamText("");

    //  Start fake loading (premium UX)
    setStreamText("Analyzing patterns...\n");

    setTimeout(() => {
      setStreamText((prev) => prev + "Detecting behavior...\n");
    }, 700);

    setTimeout(() => {
      setStreamText((prev) => prev + "Generating insights...\n\n");
    }, 1400);

    try {
      //  Call Gemini API
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({
          prompt: `
        Brutal mode: ${harshMode ? "ON" : "OFF"}

        User financial data:
        Spending: ${spending}${category && category.trim() ? `\nSpending category: ${category}` : ""}
        Problem: ${problem}
        Income: ${income}
        Score: ${score}

        Return ONLY valid JSON in the EXACT format below. Do NOT include any extra text, explanations, or markdown:

        {
        "personality": "<single-line personality insight, adapt to brutal mode>",
        "insight": "<what the user is doing wrong>",
        "fix": "<3 simple actionable steps separated by \\n (DO NOT separate by 1,2 numbers or bullets or any symbols)>",
        "impact": "<what happens if they don’t improve>"
        }
        `,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch analysis");

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";
      let done = false;

      // ✅ 4. STREAM RESPONSE
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value);
        fullText += chunk;

        setStreamText((prev) => prev + chunk); // 🔥 live typing
      }

      //  Parse JSON → final result

      //  Remove markdown blocks
      let cleaned = fullText.replace(/```json|```/g, "").trim();

      //  Sometimes LLM adds text before/after JSON — try to extract {...} block
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in LLM output");

      cleaned = match[0];

      //  Safely parse
      const parsed = JSON.parse(cleaned);

      const rawFix = parsed.fix;

      //  Handle ALL cases safely
      let fixList: string[] = [];

      if (typeof rawFix === "string") {
        fixList = rawFix
          .split(/\d+\.\s|•\s|-\s/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      } else if (Array.isArray(rawFix)) {
        fixList = rawFix;
      } else {
        fixList = ["No suggestions available"];
      }

      setResult({
        ...parsed,
        personality:
          parsed.personality || getPersonality(score, category, harshMode),
        fix: fixList.join("\n"),
      });
    } catch (error) {
      toast.error("Something went wrong! Please try again later. ");
      console.log("Error while analysing : ", error);
    } finally {
      setLoading(false);
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

  const downloadResult = () => {
    if (!result) {
      toast.error("Can't download result! Please try again later.");
      return;
    }

    const doc = new jsPDF();

    // Page padding
    const marginX = 20;
    let y = 30;

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("MoneyMind Report", marginX, y);

    // 👉 ADD SCORE HERE (same Y level as title)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 255);
    doc.text(`Score: ${score} / 100`, 150, y);

    // Subtitle
    y += 8;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text("Your financial behavior analysis", marginX, y);

    // Divider
    y += 10;
    doc.setDrawColor(220);
    doc.line(marginX, y, 190, y);

    y += 12;

    // 🔹 Helper function for sections
    const addSection = (title: string, content: string) => {
      // Section title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(title.toUpperCase(), marginX, y);

      y += 6;

      // Content
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0);

      const splitText = doc.splitTextToSize(content, 170);
      doc.text(splitText, marginX, y);

      y += splitText.length * 6 + 10;
    };

    // Sections
    addSection("Personality", result.personality);
    addSection("Insight", result.insight);
    addSection("Action Plan", result.fix);
    addSection("Impact", result.impact);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Generated by MoneyMind • Behavioral Finance AI", marginX, 280);

    doc.save("MoneyMind-Report.pdf");
  };

  const iColor = sectionColors.insight;
  const fColor = sectionColors.fixes;
  const imColor = sectionColors.impact;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-black text-white px-1.5 py-3 md:p-6">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center max-w-6xl mx-auto mb-20 md:mb-5">
        <Link
          href={"/"}
          className="text-xs md:text-xl font-bold cursor-pointer"
        >
          🧠 MoneyMind
        </Link>

        {/* 👉 PRIMARY ACTION */}
        <Link
          href="/chat"
          className="group bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm md:text-base rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200 ease-out"
        >
          Start Chat
          <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </nav>
      <h1 className="text-2xl font-bold text-center mb-6">
        🧠 Analyze Your Money Behavior
      </h1>

      {/* FORM */}
      <div className="max-w-xl mx-auto space-y-4">
        <input
          placeholder="What do you spend most on?"
          value={spending}
          onChange={(e) => setSpending(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700"
        />

        <input
          placeholder="Your biggest money problem?"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700"
        />

        <input
          placeholder="Monthly income (₹)"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700"
        />

        <div className="flex gap-1.5 justify-between items-center w-full h-16">
          <div className="flex flex-col md:flex-row gap-1.5 justify-center md:justify-start items-start md:items-center cursor-pointer flex-1 text-xs md:text-sm  whitespace-pre-wrap">
            Harsh Mode &nbsp;:
            {harshMode ? (
              <ToggleRight
                onClick={() => setHarshMode(!harshMode)}
                className="text-blue-500 text-xl"
                size={36}
                strokeWidth={1}
              />
            ) : (
              <ToggleLeft
                onClick={() => setHarshMode(!harshMode)}
                className="text-white text-xl"
                size={36}
                strokeWidth={1}
              />
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={harshMode ? "harsh" : "normal"}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex-2 text-xs md:text-sm ${harshMode ? "text-red-400" : "text-gray-400"}`}
            >
              {harshMode
                ? "⚠️ Harsh Mode ON: Preparing to roast your financial habits..."
                : "Too soft? Enable Harsh Mode for brutal honesty."}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.button
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAnalyze}
          className="w-full bg-blue-600 py-3 rounded-xl"
        >
          Analyze My Behavior 🚀
        </motion.button>
      </div>

      {/* LOADING */}
      {/* Loading / Streaming */}
      {loading && !result && (
        <div className="mt-6 whitespace-pre-wrap text-gray-400">
          {streamText}
          <span className="animate-pulse">|</span>
        </div>
      )}

      {/* Final Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-12 p-6 bg-gray-900 rounded-2xl border border-gray-800 text-left relative"
        >
          <ScoreCard result={result} score={score} />

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className={`p-4 rounded-xl border ${iColor.border} ${iColor.bg}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className={`w-4 h-4 ${iColor.title}`} />
                <p className={`text-sm ${iColor.title}`}>INSIGHT</p>
              </div>

              <p className="text-gray-300 leading-relaxed">{result.insight}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
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
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className={`p-4 rounded-xl border ${imColor.border} ${imColor.bg}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className={`w-4 h-4 ${imColor.title}`} />
                <p className={`text-sm ${imColor.title}`}>IMPACT</p>
              </div>

              <p className="text-gray-300 leading-relaxed">{result.impact}</p>
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
    </div>
  );
}
