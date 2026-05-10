export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Statement from "@/models/Statement";
import Finance from "@/models/Finance";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createNotification } from "@/lib/createNotification";

import {
  categorizeSpending,
  predictExpenseWithAI,
} from "@/lib/ai/predictExpenseWithAI";

import nodemailer from "nodemailer";
import User from "@/models/User";
import { safeParseAI } from "@/lib/statementParseHelpers";
import { currencyMap } from "@/lib/currencyMap";

// =========================
// CONFIG
// =========================
const BATCH_SIZE = 2;
const ANALYSIS_INTERVAL = 24 * 60 * 60 * 1000;
const EMAIL_INTERVAL = 7 * 24 * 60 * 60 * 1000;
const MAX_HISTORY = 50;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn: () => Promise<any>, retries = 3) {
  try {
    return await fn();
  } catch (err: any) {
    if (err?.status === 429 && retries > 0) {
      const delay = (4 - retries) * 2000; // 2s → 4s → 6s
      console.log(`⏳ Retry in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}

// =========================
// 🧠 GEMINI ANALYSIS
// =========================
async function analyzeWithGemini(context: any) {
  const systemPrompt = `
You are an expert financial behavior analysis AI.

Your task is to analyze a user's financial data and return a STRICT JSON response.

You MUST strictly follow the schema below. Do NOT add, remove, or rename fields.

=========================
 OUTPUT JSON SCHEMA
=========================
{
  "score": number,               // integer (0–100)

  "personality": string,         // short label (max 3 words)

  "insights": [
    {
      "text": string,            // clear observation
      "type": string             // one of: "risk" | "habit" | "opportunity"
    }
  ],

  "fixes": [
    {
      "action": string,          // specific actionable step
      "priority": string         // one of: "low" | "medium" | "high"
    }
  ],

  "impact": {
    "savingsPotential": number,  // realistic monthly saving amount
    "projectedSavings": number,  // projected 3-month savings
    "riskLevel": string          // "low" | "medium" | "high"
  },

  "snapshot": {
    "income": number,
    "totalSpent": number,
    "savingsRate": number        // percentage (0–100)
  }
}

=========================
 STRICT RULES
=========================
- Return ONLY valid JSON (no markdown, no explanation)
- All fields are REQUIRED (no missing keys)
- Do NOT return null or undefined
- Numbers must be realistic and consistent with data
- score must be an integer between 0 and 100
- savingsRate must be between 0 and 100
- personality must be short (max 3 words)
- insights: max 5 items
- fixes: max 5 items
- Do NOT hallucinate unrealistic values
- Ensure calculations match input data
- Analyze the user's spending habits considering local cost of living, cultural habits, and typical expenses in ${context.userCountry}

=========================
  CRITICAL
=========================
- insights MUST be a JSON array, NOT a string
- fixes MUST be a JSON array, NOT a string
- Do NOT stringify arrays
- Do NOT wrap output in quotes

=========================
 ANALYSIS LOGIC
=========================
- Compare income vs expenses
- Detect overspending patterns
- Evaluate savings behavior
- Consider financial goals if provided
- Identify risky habits (impulsive, high lifestyle spending)
- Suggest practical improvements

=========================
 FINAL INSTRUCTION
=========================
If unsure, return best possible estimate BUT still follow schema exactly.

Return ONLY JSON.
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemPrompt,
  });

  // Extract from context
  const safeTransactions = (context.transactions || []).slice(0, 150);

  const safeContext = {
    transactions: safeTransactions,
    monthlyIncome: context.monthlyIncome,
    goals: context.goals,
  };

  const userPrompt = `
Analyze the following financial data:

${JSON.stringify(safeContext)}

Return the result in the required JSON format.
`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();

  // 🧹 clean JSON
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return safeParseAI(parsed);
  } catch (err) {
    console.error("❌ Gemini JSON parse failed:", cleaned);
    throw err;
  }
}

// =========================
// 📧 EMAIL
// =========================
export async function sendEmail(
  userId: string,
  data: {
    score: number;
    predictedExpense: number;
    essential: number;
    lifestyle: number;
    impulsive: number;
    suggestion: string;
    country: string;
  },
) {
  try {
    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found!");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_ACCOUNT_USER,
        pass: process.env.GOOGLE_ACCOUNT_PASS,
      },
    });

    const html = getEmailTemplate(data);

    await transporter.sendMail({
      from: `"Moneymind AI" <${process.env.GOOGLE_ACCOUNT_USER}>`,
      to: user.email,
      subject: "📊 Your Weekly Financial Report",
      html,
    });

    console.log("✅ Email sent to:", user.email);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
}

function getEmailTemplate(data: any) {
  const currency_s =
    currencyMap[data.country as keyof typeof currencyMap] || "₹";
  const impulsiveWarning =
    data.impulsive > data.essential * 0.6
      ? `<p style="color:#ef4444;">⚠️ High impulsive spending detected</p>`
      : "";

  return `
  <div style="background:#0f172a;padding:30px;font-family:Arial;color:white;">
    
    <div style="max-width:600px;margin:auto;background:#111827;border-radius:16px;padding:24px;">
      
      <h2 style="text-align:center;margin-bottom:20px;">
        📊 Weekly Financial Report
      </h2>

      <!-- SCORE -->
      <div style="background:#1f2937;padding:16px;border-radius:12px;margin-bottom:15px;">
        <p style="color:#9ca3af;font-size:14px;">Financial Health</p>
        <h1 style="color:#22c55e;margin:0;">${data.score}/100</h1>
      </div>

      <!-- PREDICTION -->
      <div style="background:#1f2937;padding:16px;border-radius:12px;margin-bottom:15px;">
        <p style="color:#9ca3af;font-size:14px;">Next Month Prediction</p>
        <h2 style="margin:0;">${currency_s}${data.predictedExpense}</h2>
      </div>

      <!-- BREAKDOWN -->
      <div style="background:#1f2937;padding:16px;border-radius:12px;margin-bottom:15px;">
        <h3 style="margin-bottom:10px;">Spending Breakdown</h3>
        <p>🧱 Essential: ${currency_s}${data.essential}</p>
        <p>🎯 Lifestyle: ${currency_s}${data.lifestyle}</p>
        <p>🔥 Impulsive: ${currency_s}${data.impulsive}</p>
        ${impulsiveWarning}
      </div>

      <!-- SUGGESTION -->
      <div style="background:#1f2937;padding:16px;border-radius:12px;margin-bottom:15px;">
        <h3>💡 AI Suggestion</h3>
        <p>${data.suggestion.toString()}</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:20px;">
        <a href="${process.env.BASE_URL}/dashboard"
          style="background:#2563eb;color:white;padding:10px 16px;
          border-radius:8px;text-decoration:none;font-size:14px;">
          Open Dashboard
        </a>
      </div>

      <p style="text-align:center;color:#6b7280;font-size:12px;margin-top:20px;">
        You're receiving this because you use Moneymind AI
      </p>

    </div>
  </div>
  `;
}

// =========================
// 🚀 WORKER
// =========================
export async function GET(req: Request) {
  console.log("🚀 Worker started at:", new Date().toISOString());
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.WORKER_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const now = new Date();
  let processed = 0;

  const finances = await Finance.find({
    statements: { $exists: true, $not: { $size: 0 } },
  }).limit(BATCH_SIZE);

  if (!finances.length) {
    console.log("⚠️ No finance records found");
    return NextResponse.json(
      {
        processed: 0,
        message: "No finance data found",
      },
      { status: 404 },
    );
  }

  for (const finance of finances) {
    try {
      // =========================
      // NO STATEMENTS CASE
      // =========================
      if (
        (!finance.statements || finance.statements.length === 0) &&
        !finance.flags?.notifiedNoStatements
      ) {
        await createNotification({
          userId: finance.userId,
          type: "STATEMENT_UPLOADED",
          title: "Get Started",
          message: "Upload your first bank statement to unlock insights",
        });

        finance.flags = {
          ...finance.flags,
          notifiedNoStatements: true,
        };

        await finance.save();

        continue; //  skip further processing
      }

      let country = "India";
      const user = await User.findById(finance.userId.toString());
      if (user) {
        country = user.country;
      }

      const lastEntry = finance.aiHistory?.at(-1);

      // =========================
      // ⏱ SKIP IF RECENT
      // =========================
      if (
        lastEntry?.createdAt &&
        now.getTime() - new Date(lastEntry.createdAt).getTime() <
          ANALYSIS_INTERVAL
      ) {
        continue;
      }
      // =========================
      // 📦 FETCH STATEMENTS
      // =========================
      const statements = await Statement.find({
        _id: { $in: finance.statements },
        status: "parsed",
      });

      if (!statements.length) {
        await createNotification({
          userId: finance.userId,
          type: "STATEMENT_PROCESSED",
          title: "Processing in Progress",
          message: "Your statements are being processed",
        });

        continue;
      }

      // =========================
      // 🧠 MERGE ALL TRANSACTIONS
      // =========================
      let allTransactions: any[] = [];

      // 📄 statement transactions
      for (const stmt of statements) {
        allTransactions.push(...(stmt.extractedTransactions || []));
      }

      // ✍️ manual transactions (VERY IMPORTANT)
      if (finance.transactions?.length) {
        allTransactions.push(...finance.transactions);
      }

      // ✍️ manual transactions (normalized)
      const normalizedManual = (finance.transactions || []).map((t: any) => ({
        amount: Number(t.amount),
        type: t.type,
        category: t.category || "Other",
        date: t.date,
      }));

      allTransactions.push(...normalizedManual);

      if (allTransactions.length === 0) {
        await createNotification({
          userId: finance.userId,
          type: "STATEMENT_PROCESSED",
          title: "No Transactions Found",
          message: "Try uploading a clearer or different statement",
        });

        continue;
      }

      // =========================
      // 🚫 DATA SUFFICIENCY CHECK
      // =========================
      const MIN_TRANSACTIONS = 15;
      const MIN_DAYS_SPAN = 7;

      const tx = allTransactions;

      // ❌ Not enough transactions
      if (tx.length < MIN_TRANSACTIONS) {
        await createNotification({
          userId: finance.userId,
          type: "ANALYSIS_SKIPPED",
          title: "Not enough data yet",
          message: "Add more transactions to unlock AI insights",
        });

        continue;
      }

      // ❌ No income info
      if (!finance.monthlyIncome || finance.monthlyIncome <= 0) {
        await createNotification({
          userId: finance.userId,
          type: "ANALYSIS_SKIPPED",
          title: "Missing income data",
          message: "Add your income to get accurate analysis",
        });

        continue;
      }

      // ❌ Check time span (avoid analyzing 1–2 day data)
      const dates = tx
        .map((t: any) => new Date(t.date))
        .filter((d) => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (dates.length > 1) {
        const diffDays =
          (dates[dates.length - 1].getTime() - dates[0].getTime()) /
          (1000 * 60 * 60 * 24);

        if (diffDays < MIN_DAYS_SPAN) {
          await createNotification({
            userId: finance.userId,
            type: "ANALYSIS_SKIPPED",
            title: "Need more history",
            message: "Upload statements covering more days for better insights",
          });

          continue;
        }
      }

      // =========================
      // 🧠 FULL AI CONTEXT
      // =========================
      const Dates: Date[] = allTransactions
        .map((t: any) => new Date(t.date))
        .filter((d: Date) => !isNaN(d.getTime()))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());

      let days: number = 0;

      if (Dates.length > 1) {
        const diffMs: number =
          Dates[Dates.length - 1].getTime() - Dates[0].getTime();

        days = diffMs / (1000 * 60 * 60 * 24);
      }

      const months = Math.max(days / 30, 1);

      const totalSpent = allTransactions
        .filter((t: any) => t.type.toLowerCase() !== "income")
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      const totalIncome = allTransactions
        .filter((t) => (t.type ?? "").toLowerCase() === "income")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const monthlySpent = totalSpent / months;

      const monthlyIncome = Math.max(
        finance.monthlyIncome,
        totalIncome / months,
      );

      const Savings = monthlyIncome - monthlySpent;

      const SavingsRate =
        monthlyIncome > 0 ? (Savings / monthlyIncome) * 100 : 0;

      // =========================
      // 🚫 SKIP IF NO MEANINGFUL CHANGE
      // =========================

      const MIN_CHANGE_THRESHOLD = 0.1; // 10%

      if (monthlySpent === 0) continue;

      if (
        (lastEntry &&
          lastEntry.snapshot?.totalSpent &&
          Math.abs(lastEntry.snapshot.totalSpent - monthlySpent) /
            monthlySpent <=
            MIN_CHANGE_THRESHOLD) ||
        finance.latest_no_of_transactions <= 5
      ) {
        console.log("⏭ Skipping AI - no significant change");
        continue;
      }

      if (finance.isDemo) {
        console.log("⏭ Skipping AI - Demo data detected");
        continue;
      }

      //  AI CALL (ONLY IF NEEDED)
      finance.latest_no_of_transactions = allTransactions.length;

      const context = {
        userCountry: country,
        summary: {
          monthlyIncome,
          monthlySpent,
          savings: Savings,
          savingsRate: SavingsRate,
        },
        transactions: allTransactions,
      };

      const currency_str =
        currencyMap[country as keyof typeof currencyMap] || "₹";

      const prediction = await predictExpenseWithAI(context);

      finance.prediction = {
        nextMonthExpense: prediction.predictedExpense,
        confidence: prediction.confidence,
        reason: prediction.reason,
      };

      finance.monthlyIncome = monthlyIncome;

      // =========================
      // 🧠 AI ANALYSIS (GEMINI)
      // =========================
      let result = await withRetry(() => analyzeWithGemini(context));

      result.snapshot.savingsRate = Math.max(
        0,
        Math.min(100, Math.round(result.snapshot.savingsRate)),
      );
      let cleanInsights = [];
      let cleanFixes = [];
      //------------------------
      // DEBUG
      //------------------------
      // console.log("\nGEMINI ANALYSIS:\n", result);
      // console.log("\nTYPE OF GEMINI ANALYSIS:\n", typeof result);
      // console.log("\nscore\n", result.score);
      // console.log("\ntypeof score\n", typeof result.score);
      // console.log("\npersonality\n", result.personality);
      // console.log("\ntypeof personality", typeof result.personality);

      // console.log("\ntype of insights\n", typeof result.insights);
      // console.log(
      //   "\ntype of insights is an array ? \n",
      //   Array.isArray(result.insights),
      // );
      // console.log("\nitems in insights\n");
      // for (const item of result.insights) {
      //   console.log(item);
      //   console.log("\ntypeof item\n", typeof item);
      // }

      // console.log("\ntype of fixes\n", typeof result.fixes);
      // console.log(
      //   "\ntype of fixes is an array ?\n",
      //   Array.isArray(result.fixes),
      // );
      // console.log("\nitems in fixes\n");
      // for (const item of result.fixes) {
      //   console.log(item);
      //   console.log("\ntypeof item\n", typeof item);
      // }

      // console.log("\n impact \n", result.impact);
      // console.log("\n type of impact \n", typeof result.impact);

      // console.log("\n snapshot \n", result.snapshot);
      // console.log("\n type of snapshot \n", typeof result.snapshot);
      //
      //------------------------------
      //
      if (!Array.isArray(result.insights)) {
        console.error("❌ insights not array:", result.insights);
        result.insights = [];
      } else {
        for (const item of result.insights) {
          let obj = { text: "", type: "" };
          obj.text = item.text;
          obj.type = item.type;
          cleanInsights.push(obj);
        }
      }

      if (!Array.isArray(result.fixes)) {
        console.error("❌ fixes not array:", result.fixes);
        result.fixes = [];
      } else {
        for (const item of result.fixes) {
          let obj = { action: "", priority: "" };
          obj.action = item.action;
          obj.priority = item.priority;
          cleanFixes.push(obj);
        }
      }

      // console.log("clean insights : ",cleanInsights);
      // console.log("clean fixes : ",cleanFixes);

      // =========================
      // 🧠 DEDUP CHECK
      // =========================
      const isSame =
        lastEntry &&
        lastEntry.score === result.score &&
        lastEntry.personality === result.personality;

      if (!isSame) {
        finance.aiHistory.push({
          score: result.score,
          personality: result.personality,
          insights: cleanInsights,
          fixes: cleanFixes,
          impact: result.impact,
          snapshot: result.snapshot,
          createdAt: now,
        });

        if (finance.aiHistory.length > MAX_HISTORY) {
          finance.aiHistory.shift();
        }
      }

      // =========================
      // 🎯 GOALS UPDATE
      // =========================
      const goals = Array.isArray(finance.goals) ? finance.goals : [];

      if (goals.length === 0) {
        console.log("⏭ Skipping goals logic - no goals found");
      } else {
        goals.forEach((goal: any) => {
          const saved = result.snapshot.income - result.snapshot.totalSpent;

          goal.progress.savedAmount = saved;

          goal.progress.percentage = (saved / goal.targetAmount) * 100;

          if (goal.progress.percentage >= 100) {
            goal.status = "achieved";
          } else if (goal.progress.percentage < 30) {
            goal.status = "at-risk";
          } else {
            goal.status = "active";
          }
        });
      }

      // =========================
      // 🎯 GOAL-BASED AFFORDABILITY
      // =========================
      const previousEntry = finance.aiHistory?.at(-1);
      // previous snapshot
      const previousSavings = previousEntry
        ? (previousEntry.snapshot.income || 0) -
          (previousEntry.snapshot.totalSpent || 0)
        : null;
      // new snapshot (AI result)
      const newSavings =
        (result.snapshot.income || 0) - (result.snapshot.totalSpent || 0);

      // 👉 get ACTIVE goals only
      const activeGoals = Array.isArray(goals)
        ? goals.filter((g: any) => g.status === "active")
        : [];

      if (activeGoals.length === 0) {
        console.log("⏭ Skipping active goals logic - no goals found");
      } else {
        for (const goal of activeGoals) {
          const requiredAmount = goal.targetAmount;

          const previousDecision =
            typeof previousSavings === "number" &&
            !Number.isNaN(previousSavings) &&
            previousSavings >= requiredAmount
              ? "YES"
              : "NO";

          const newDecision = newSavings >= requiredAmount ? "YES" : "NO";

          // 🧠 progress %
          const progress = (newSavings / requiredAmount) * 100;

          // =========================
          // 🔥 TRIGGER: NOW AFFORDABLE
          // =========================
          if (previousDecision === "NO" && newDecision === "YES") {
            await createNotification({
              userId: finance.userId,
              type: "GOAL_UPDATE",
              title: `You can afford ${goal.title} now 🎉`,
              message: `Your savings crossed ${currency_str}${requiredAmount}`,
              metadata: {
                goalId: goal._id,
              },
            });
          }

          // =========================
          // ⚠️ PROGRESS UPDATE NOTIFICATION
          // =========================
          if (progress >= 70 && progress < 100 && !goal.notified70) {
            await createNotification({
              userId: finance.userId,
              type: "GOAL_UPDATE",
              title: `You're close to ${goal.title} 🚀`,
              message: `You've reached ${Math.round(progress)}% of your goal`,
            });

            goal.notified70 = true;
          }

          // =========================
          // 📉 RISK DETECTION
          // =========================
          if (previousSavings !== null) {
            if (newSavings < previousSavings * 0.7) {
              await createNotification({
                userId: finance.userId,
                type: "GOAL_UPDATE",
                title: `Goal at risk ⚠️`,
                message: `Your savings dropped. ${goal.title} may be delayed.`,
              });
            }
          }
        }
      }

      // =========================
      // 📧 WEEKLY EMAIL
      // =========================
      if (
        !finance.lastEmailSentAt ||
        now.getTime() - finance.lastEmailSentAt.getTime() > EMAIL_INTERVAL
      ) {
        const tx = context.transactions;

        // category breakdown
        const { essential, lifestyle, impulsive } = categorizeSpending(tx);

        const allFixActions = result.fixes?.map((fix: any) => fix.action) || [];

        await sendEmail(finance.userId.toString(), {
          score: result.score,
          predictedExpense: prediction.predictedExpense,
          essential,
          lifestyle,
          impulsive,
          suggestion:
            impulsive > essential * 0.7
              ? "You're overspending impulsively. Try setting a weekly limit."
              : allFixActions.join("\n") || "Reduce impulsive spending",
          country,
        });

        ((finance.breakdown = {
          essential,
          lifestyle,
          impulsive,
          updatedAt: new Date(),
        }),
          (finance.lastEmailSentAt = now));
      }

      // =========================
      // 📊 LIFE METRICS UPDATE
      // =========================

      // 🌍 COUNTRY CONFIG
      const countryConfig = {
        India: {
          minSurvival: 2,
          idealSurvival: 6,
          minSavingsRate: 10,
        },
        default: {
          minSurvival: 3,
          idealSurvival: 6,
          minSavingsRate: 15,
        },
      };
      const income = result.snapshot.income || 0;
      const spent = result.snapshot.totalSpent || 0;

      const lifemetrics_savings = income - spent;
      const avgMonthlyExpense = spent / 3 || 1;

      const survivalMonths = lifemetrics_savings / avgMonthlyExpense;

      // 🔹 savings rate
      const lifemetrics_savingsRate =
        income > 0 ? (lifemetrics_savings / income) * 100 : 0;

      const config =
        countryConfig[country as keyof typeof countryConfig] ||
        countryConfig.India;

      // 🔹 stability score (simple model)
      let stability = 50;

      // 🔹 Savings behavior impact
      if (lifemetrics_savingsRate >= config.minSavingsRate + 10) {
        stability += 20;
      } else if (lifemetrics_savingsRate >= config.minSavingsRate) {
        stability += 10;
      } else {
        stability -= 15;
      }

      // 🔹 Emergency buffer impact
      if (survivalMonths >= config.idealSurvival) {
        stability += 25;
      } else if (survivalMonths >= config.minSurvival) {
        stability += 10;
      } else {
        stability -= 25;
      }

      // 🔹 Negative savings penalty
      if (lifemetrics_savings <= 0) {
        stability -= 20;
      }

      // 🔹 Clamp
      stability = Math.max(0, Math.min(100, Math.round(stability)));

      // =========================
      // ⚠️ STRESS RISK (ALIGNED WITH MODEL)
      // =========================

      let stressRisk: "low" | "medium" | "high" = "low";

      if (
        lifemetrics_savings <= 0 ||
        survivalMonths < config.minSurvival ||
        lifemetrics_savingsRate < config.minSavingsRate
      ) {
        stressRisk = "high";
      } else if (
        survivalMonths < config.idealSurvival ||
        lifemetrics_savingsRate < config.minSavingsRate + 5
      ) {
        stressRisk = "medium";
      }

      // =========================
      // 🛟 EMERGENCY FUND STATUS
      // =========================

      let emergencyFundStatus: "poor" | "average" | "good" = "poor";

      if (survivalMonths >= config.idealSurvival) {
        emergencyFundStatus = "good";
      } else if (survivalMonths >= config.minSurvival) {
        emergencyFundStatus = "average";
      }

      // =========================
      // 📦 FINAL OBJECT
      // =========================

      finance.lifeMetrics = {
        financialStabilityScore: stability,
        survivalMonths: Number(Math.max(0, survivalMonths).toFixed(1)),
        stressRisk,
        savingsRate: Math.round(lifemetrics_savingsRate),
        emergencyFundStatus,
        updatedAt: new Date(),
      };

      // =========================
      // 🎮 GAMIFICATION (INTELLIGENT)
      // =========================
      if (!finance.gamification) {
        finance.gamification = {
          level: 1,
          xp: 0,
          streaks: { underBudgetDays: 0 },
          achievements: [],
        };
      }

      // 🎯 XP based on score
      const score = result.score || 0;
      finance.gamification.xp += Math.floor(score / 5);

      // 🧠 LEVEL SYSTEM
      finance.gamification.level =
        Math.floor(finance.gamification.xp / 100) + 1;

      // 🏆 ACHIEVEMENTS (SMART)
      const achievements = finance.gamification.achievements || [];

      // High discipline
      if (
        score > 75 &&
        !achievements.find((a: any) => a.title === "📈 High Discipline")
      ) {
        achievements.push({
          title: "📈 High Discipline",
          unlockedAt: new Date(),
        });
      }

      // Budget master
      if (
        result.snapshot.totalSpent < result.snapshot.income * 0.7 &&
        !achievements.find((a: any) => a.title === "🔥 Budget Master")
      ) {
        achievements.push({
          title: "🔥 Budget Master",
          unlockedAt: new Date(),
        });
      }

      // Saving milestone
      if (
        result.snapshot.income - result.snapshot.totalSpent > 5000 &&
        !achievements.find((a: any) => a.title === "💰 Smart Saver")
      ) {
        achievements.push({
          title: "💰 Smart Saver",
          unlockedAt: new Date(),
        });
      }

      finance.gamification.achievements = achievements;
      finance.gamification.lastUpdated = new Date();

      await finance.save();

      await createNotification({
        userId: finance.userId,
        type: "ANALYSIS_READY",
        title: "Analysis Ready 🎉",
        message: "Your financial analysis is now available",
        metadata: {
          financeId: finance._id,
        },
      });

      processed++;
      await sleep(1500); // 1.5 sec delay
    } catch (err) {
      console.error("❌ Worker error:", err);
    }
  }

  return NextResponse.json({ processed }, { status: 200 });
}
