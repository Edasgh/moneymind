"use server";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import Statement from "@/models/Statement";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { canAfford } from "@/lib/canAfford";
import { authOptions } from "../auth/[...nextauth]/route";
import { currencyMap } from "@/lib/currencyMap";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function extractGoalFromMessage(message: string) {
  const text = message.toLowerCase();

  // =========================
  //  AMOUNT EXTRACTION
  // =========================
  const amountMatch = text.match(
    /(?:₹|\$|£|cad|inr|rs)?\s?(\d+(?:,\d{3})*(?:\.\d+)?)(?:\s?(k|lakh|lac|m|million))?/i,
  );

  let amount: number | null = null;

  if (amountMatch) {
    let value = Number(amountMatch[1].replace(/,/g, ""));
    const unit = amountMatch[2]?.toLowerCase();

    // normalize units
    if (unit === "k") value *= 1_000;
    if (unit === "lakh" || unit === "lac") value *= 100_000;
    if (unit === "m" || unit === "million") value *= 1_000_000;

    amount = value;
  }

  // =========================
  //  GOAL DETECTION
  // =========================
  let title = "Savings Goal";

  if (/car|vehicle/i.test(text)) title = "Car";
  else if (/bike|scooter/i.test(text)) title = "Bike";
  else if (/house|home|apartment|flat/i.test(text)) title = "House";
  else if (/trip|travel|vacation|holiday/i.test(text)) title = "Travel";
  else if (/education|college|course|study|fees/i.test(text))
    title = "Education";
  else if (/emergency|backup|fund/i.test(text)) title = "Emergency Fund";
  else if (/phone|laptop|macbook|iphone|device|gadget/i.test(text))
    title = "Gadget";
  else if (/wedding|marriage/i.test(text)) title = "Wedding";

  // 🚀 RETURN
  return amount ? { title, amount } : null;
}

function extractAmount(text: string): number {
  const match = text.match(
    /(?:₹|\$|£|rs|inr|cad)?\s?(\d+(?:,\d{3})*(?:\.\d+)?)(?:\s?(k|lakh|lac|m|million))?/i,
  );

  if (!match) return 0;

  let value = Number(match[1].replace(/,/g, ""));
  const unit = match[2]?.toLowerCase();

  // 🔢 Normalize units
  if (unit === "k") value *= 1_000;
  if (unit === "lakh" || unit === "lac") value *= 100_000;
  if (unit === "m" || unit === "million") value *= 1_000_000;

  return value;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ reply: "Unauthorized" }, { status: 401 });
    }

    const { message, history, mode, goalId } = await req.json();

    const currency_str =
      currencyMap[
        session.user.country?.toString() as keyof typeof currencyMap
      ] || "₹";

    // =========================
    //  SYSTEM PROMPT
    // =========================
    const GENERAL_PROMPT = `
    You are MoneyMind — a financial literacy and inclusion assistant.

    You do NOT have access to user's personal financial data.

    Explain financial concepts in simple terms suitable for a user in ${session.user.country}, including:
  - local financial systems (UPI, credit cards, etc.)
  - realistic saving methods available in that country

    Your goal:
    - Explain finance in SIMPLE language
    - Help beginners, students, and low-income users
    - Promote safe and smart financial habits

    FOCUS AREAS:
    - Banking basics (accounts, UPI, cards)
    - Saving habits
    - Budgeting
    - Credit awareness
    - Fraud prevention
    - Insurance basics
    - Investing fundamentals (simple only)

    RULES:
    - Max 2–4 sentences
    - Use very simple language (like explaining to a beginner)
    - Avoid jargon OR explain it clearly
    - Give 1 practical takeaway
    - Be supportive, never judgmental

    STYLE:
    - Friendly teacher, not expert jargon
    - Use relatable examples (daily life, small money)

    IMPORTANT:
    - Do NOT assume user has money or access
    - Encourage small steps (${currency_str}100, ${currency_str}500 savings mindset)

    STRICT:
    - Plain text ONLY
    - Under 100 words ONLY
    - NO markdown
    `;
    const PERSONAL_PROMPT = `
    You are MoneyMind — a behavioral finance AI.

    You are analyzing THIS specific user's transaction data and financial behavior.

    If user ask about their affordability to buy an item , Evaluate affordability based on typical living costs and financial norms in ${session.user.country}
    
    RULES:
    - Max 2–3 sentences
    - Be sharp, slightly bold, insightful
    - Identify patterns in spending
    - Give 1 actionable fix
    - End with a question

    STYLE:
    - Talk like a smart financial coach
    - Be practical, not theoretical

    IF DATA IS LOW:
    - Ask user for more details instead of guessing

    STRICT:
    - Plain text ONLY
    - Under 120 words ONLY
    - NO markdown
    `;

    let systemPrompt = mode === "general" ? GENERAL_PROMPT : PERSONAL_PROMPT;

    const chatHistory =
      history?.map((m: any) => ({
        role: m.type === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })) || [];

    let contents = [];

    const isBuyingTopic = /(buy|purchase|afford)/i.test(message);
    const isDecisionIntent = /(can i|should i|is it ok to)/i.test(message);

    const isAffordQuery = isBuyingTopic && isDecisionIntent;

    if (mode === "personal") {
      const finance = await Finance.findOne({ userId: session.user.id });

      if (!finance) {
        return Response.json({
          reply: "I need your financial data first. Upload a statement.",
        });
      }

      if (finance.monthlyIncome <= 0) {
        return Response.json({
          reply: "Please add your monthly income to get started.",
        });
      }

      if (isAffordQuery) {
        // extract price (basic regex)
        const price = extractAmount(message);

        if (!price || price <= 0) {
          return Response.json({
            reply: "Tell me the price so I can evaluate affordability.",
          });
        }

        const lastSnapshot = finance.aiHistory?.at(-1)?.snapshot;

        if (!lastSnapshot) {
          return Response.json({
            reply: "I don't have enough data yet. Try uploading a statement.",
          });
        }

        const goalData = extractGoalFromMessage(message);

        if (goalData) {
          const alreadyExists = finance.goals.some(
            (g: any) =>
              g.title.toLowerCase() === goalData.title.toLowerCase() &&
              g.targetAmount === goalData.amount,
          );

          if (!alreadyExists) {
            finance.goals.push({
              title: goalData.title,
              targetAmount: goalData.amount,
              status: "active",
            });

            await finance.save();
          }
        }

        const savings = lastSnapshot.income - lastSnapshot.totalSpent;

        const result = canAfford({
          savings,
          price,
          monthlySavings: savings,
          country: session.user.country?.toString(),
        });

        return Response.json({
          reply: `${result.decision === "YES" ? "✅ Yes" : "❌ No"} — ${result.reason}. ${result.suggestion || ""}`,
        });
      }

      // =========================
      //  FETCH USER TRANSACTIONS
      // =========================

      let allTransactions: any[] = [];

      if (finance.statements?.length) {
        const statements = await Statement.find({
          _id: { $in: finance.statements },
          status: "parsed",
        });

        statements.forEach((s) => {
          allTransactions.push(...(s.extractedTransactions || []));
        });
      }

      //  LIMIT DATA
      const safeTransactions = allTransactions.slice(-100);

      // =========================
      //  BUILD CONTEXT
      // =========================
      const transactionContext =
        safeTransactions.length > 0
          ? `User Transactions:\n${JSON.stringify(safeTransactions)}`
          : `No transaction data available. Ask user about income, expenses, and habits before giving advice.`;

      const latestAnalysis = finance.aiHistory?.at(-1);

      const aiContext = latestAnalysis
        ? `
        Financial Profile:
        - Personality: ${latestAnalysis.personality}
        - Financial Score: ${latestAnalysis.score}

        Insights:
        ${latestAnalysis.insights.map((i: any) => `- ${i.text}`).join("\n")}

        Risks:
        ${latestAnalysis.impact?.riskLevel}

        Snapshot:
        - Income: ${latestAnalysis.snapshot?.income}
        - Spent: ${latestAnalysis.snapshot?.totalSpent}
        - Savings Rate: ${latestAnalysis.snapshot?.savingsRate}%

        Suggested Fixes:
        ${latestAnalysis.fixes.map((f: any) => `- ${f.action}`).join("\n")}
        `: transactionContext;
      contents = [
        {
          role: "user",
          parts: [{ text: aiContext }],
        },
        ...chatHistory,
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];
    } else if (mode === "general") {
      if (isAffordQuery) {
        return Response.json({
          reply:
            "I can explain how to decide affordability, but for your personal situation switch to personal mode.",
        });
      }

      contents = [
        ...chatHistory,
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];
    } else if (mode === "goal") {
      const finance = await Finance.findOne({
        userId: session.user.id,
      });

      if (!finance) {
        return Response.json({
          reply: "I need your financial data first.",
        });
      }

      const goal = finance.goals.id(goalId);

      if (!goal) {
        return Response.json({
          reply: "Goal not found.",
        });
      }

      const latestSnapshot = finance.aiHistory?.at(-1)?.snapshot;

      if (!latestSnapshot) {
        return Response.json({
          reply: "Not enough financial data yet.",
        });
      }

      const monthlyIncome = latestSnapshot.income || 0;
      const monthlySpent = latestSnapshot.totalSpent || 0;
      const monthlySavings = Math.max(monthlyIncome - monthlySpent, 0);

      const remaining = goal.targetAmount - (goal.progress?.savedAmount || 0);

      const monthsNeeded =
        monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : null;

      const GOAL_PROMPT = `
      You are MoneyMind Goal AI, a realistic financial coach for ${session.user.country}.

      Goal:
      ${goal.title}
      Target: ${goal.targetAmount}
      Saved: ${goal.progress?.savedAmount || 0}
      Remaining: ${remaining}

      Monthly Finances:
      Income: ${monthlyIncome}
      Spending: ${monthlySpent}
      Savings: ${monthlySavings}

      Respond with:
      - realistic timeline
      - biggest spending problem
      - 1 practical weekly action
      - concise honest advice

      STRICT Rules:
      - Under 80 words ONLY
      - 1–2 sentences ONLY
      - practical, direct, country-aware
      - plain text ONLY
      `;
      systemPrompt = GOAL_PROMPT;
      contents = [
        {
          role: "user",
          parts: [
            {
              text: `Help me achieve this goal. Estimated months possible: ${monthsNeeded ?? "unknown"}
            `,
            },
          ],
        },
      ];
    } else {
      throw new Error("Invalid mode!");
    }

    //Initialize model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt,
    });

    // CALL AI
    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        temperature: mode === "general" ? 0.4 : 0.6,
      },
    });

    const text = result.response.text().trim();

    return Response.json({ reply: text });
  } catch (err) {
    console.error(err);
    return Response.json({ reply: "Something went wrong." }, { status: 500 });
  }
}
