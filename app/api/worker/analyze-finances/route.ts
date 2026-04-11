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

// =========================
// CONFIG
// =========================
const BATCH_SIZE = 5;
const ANALYSIS_INTERVAL = 24 * 60 * 60 * 1000;
const EMAIL_INTERVAL = 7 * 24 * 60 * 60 * 1000;
const MAX_HISTORY = 50;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// =========================
// 🧠 GEMINI ANALYSIS
// =========================
async function analyzeWithGemini(context: any) {
  const systemPrompt = `
You are an expert financial behavior analysis AI.

Your job is to analyze user's financial data and return structured insights.

You MUST consider:
- spending vs income
- savings behavior
- financial goals progress
- risk patterns

You MUST:
- Always return STRICT valid JSON
- Never include explanations, markdown, or extra text
- Be consistent and deterministic
- Keep insights concise and realistic

Analysis Goals:
- Evaluate financial health (score 0–100)
- Identify spending patterns and risky behaviors
- Classify user's financial personality
- Suggest actionable improvements
- Estimate financial impact and savings potential

Output Rules:
- score must be between 0 and 100
- personality must be short
- insights must highlight patterns
- fixes must be practical
- impact must include numeric estimates
- snapshot must reflect actual values

STRICT REQUIREMENT:
Return ONLY valid JSON.
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
    return JSON.parse(cleaned);
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
        <h2 style="margin:0;">₹${data.predictedExpense}</h2>
      </div>

      <!-- BREAKDOWN -->
      <div style="background:#1f2937;padding:16px;border-radius:12px;margin-bottom:15px;">
        <h3 style="margin-bottom:10px;">Spending Breakdown</h3>
        <p>🧱 Essential: ₹${data.essential}</p>
        <p>🎯 Lifestyle: ₹${data.lifestyle}</p>
        <p>🔥 Impulsive: ₹${data.impulsive}</p>
        ${impulsiveWarning}
      </div>

      <!-- SUGGESTION -->
      <div style="background:#1f2937;padding:16px;border-radius:12px;margin-bottom:15px;">
        <h3>💡 AI Suggestion</h3>
        <p>${data.suggestion}</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:20px;">
        <a href="http://localhost:3000/dashboard"
          style="background:#2563eb;color:white;padding:10px 16px;
          border-radius:8px;text-decoration:none;font-size:14px;">
          Open Dashboard
        </a>
      </div>

      <p style="text-align:center;color:#6b7280;font-size:12px;margin-top:20px;">
        You're receiving this because you use Finance AI
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
    return NextResponse.json({
      processed: 0,
      message: "No finance data found",
    },{status:404});
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
      // 🧠 FULL AI CONTEXT
      // =========================
      const context = {
        transactions: allTransactions,
        monthlyIncome: finance.monthlyIncome,
        goals: finance.goals,
      };

      const prediction = await predictExpenseWithAI(context);

      finance.prediction = {
        nextMonthExpense: prediction.predictedExpense,
        confidence: prediction.confidence,
        reason: prediction.reason,
      };

      // =========================
      // 🧠 AI ANALYSIS (GEMINI)
      // =========================
      const result = await analyzeWithGemini(context);

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
          insights: result.insights,
          fixes: result.fixes,
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
      finance.goals.forEach((goal: any) => {
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

      // =========================
      // 🎯 GOAL-BASED AFFORDABILITY
      // =========================
      const previousEntry = finance.aiHistory?.at(-1);

      // previous snapshot
      const previousSavings =
        previousEntry?.snapshot?.income - previousEntry?.snapshot?.totalSpent;

      // new snapshot (AI result)
      const newSavings = result.snapshot.income - result.snapshot.totalSpent;

      // 👉 get ACTIVE goals only
      const activeGoals = (finance.goals || []).filter(
        (g: any) => g.status === "active",
      );

      for (const goal of activeGoals) {
        const requiredAmount = goal.targetAmount;

        const previousDecision =
          previousSavings >= requiredAmount ? "YES" : "NO";

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
            message: `Your savings crossed ₹${requiredAmount}`,
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
        if (newSavings < previousSavings * 0.7) {
          await createNotification({
            userId: finance.userId,
            type: "GOAL_UPDATE",
            title: `Goal at risk ⚠️`,
            message: `Your savings dropped. ${goal.title} may be delayed.`,
          });
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

        await sendEmail(finance.userId.toString(), {
          score: result.score,
          predictedExpense: prediction.predictedExpense,
          essential,
          lifestyle,
          impulsive,
          suggestion:
            impulsive > essential * 0.7
              ? "You're overspending impulsively. Try setting a weekly limit."
              : result.fixes?.[0] || "Reduce impulsive spending",
        });

        ((finance.breakdown = {
          essential,
          lifestyle,
          impulsive,
          updatedAt: new Date(),
        }),
          (finance.lastEmailSentAt = now));
      }

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
    } catch (err) {
      console.error("❌ Worker error:", err);
    }
  }

  return NextResponse.json({ processed },{status:200});
}
