import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Statement from "@/models/Statement";
import Finance from "@/models/Finance";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createNotification } from "@/lib/createNotification";

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
async function analyzeWithGemini(transactions: any[]) {
  const systemPrompt = `
You are an expert financial behavior analysis AI.

Your job is to analyze user transaction data and return structured financial insights.

You MUST:
- Always return STRICT valid JSON
- Never include explanations, markdown, or extra text
- Be consistent and deterministic in output format
- Keep insights concise, practical, and realistic

Analysis Goals:
- Evaluate financial health (score 0–100)
- Identify spending patterns and risky behaviors
- Classify user's financial personality
- Suggest actionable improvements
- Estimate financial impact and savings potential

Output Rules:
- score must be between 0 and 100
- personality must be a short descriptive label
- insights must highlight patterns, risks, or habits
- fixes must be practical and prioritized
- impact must include realistic numeric estimates
- snapshot must reflect actual computed values

Tone:
- Professional
- Analytical
- Non-judgmental
- Clear and concise

STRICT REQUIREMENT:
Return ONLY valid JSON. No extra text.
`;
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  // 🔥 reduce tokens (VERY IMPORTANT)
  const safeTransactions = transactions.slice(0, 150);

  const userPrompt = `
Analyze the following transactions:

${JSON.stringify(safeTransactions)}

Return the result in the required JSON format.
`;

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: userPrompt }] },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  });
  const text = result.response.text();

  // 🧹 clean JSON (VERY IMPORTANT)
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Gemini JSON parse failed:", cleaned);
    throw err;
  }
}

// =========================
// 📧 EMAIL (mock)
// =========================
async function sendEmail(userId: string, analysis: any) {
  console.log("📧 Weekly email sent to:", userId);
}

// =========================
// 🚀 WORKER
// =========================
export async function GET() {
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
    });
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

      let allTransactions: any[] = [];

      for (const stmt of statements) {
        allTransactions.push(...(stmt.extractedTransactions || []));
      }

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
      // 🧠 AI ANALYSIS (GEMINI)
      // =========================
      const result = await analyzeWithGemini(allTransactions);

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
      // 📧 WEEKLY EMAIL
      // =========================
      if (
        !finance.lastEmailSentAt ||
        now.getTime() - finance.lastEmailSentAt.getTime() > EMAIL_INTERVAL
      ) {
        await sendEmail(finance.userId.toString(), result);
        finance.lastEmailSentAt = now;
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

  return NextResponse.json({ processed });
}
