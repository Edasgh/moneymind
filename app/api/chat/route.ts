"use server";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import Statement from "@/models/Statement";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { canAfford } from "@/lib/canAfford";
import { authOptions } from "../auth/[...nextauth]/route";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

function extractGoalFromMessage(message: string) {
  const amountMatch = message.match(/₹?\s?(\d+[,\d]*)/);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : null;

  let title = "Goal";

  if (/car/i.test(message)) title = "Car";
  else if (/bike/i.test(message)) title = "Bike";
  else if (/house|home|apartment|flat/i.test(message)) title = "House";

  return amount ? { title, amount } : null;
}

function extractAmount(text: string) {
  const match = text.match(/₹?\s?(\d+[,\d]*)/);
  if (!match) return 0;

  return Number(match[1].replace(/,/g, ""));
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ reply: "Unauthorized" }, { status: 401 });
    }

    const { message, history } = await req.json();

    const isAffordQuery = /(afford|buy|purchase)/i.test(message);

    if (isAffordQuery) {
      // extract price (basic regex)
      const price = extractAmount(message);

      const finance = await Finance.findOne({ userId: session.user.id });

      if (!finance) {
        return Response.json({
          reply: "I need your financial data first. Upload a statement.",
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
            g.title === goalData.title && g.targetAmount === goalData.amount,
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
      });

      return Response.json({
        reply: `${result.decision === "YES" ? "✅ Yes" : "❌ No"} — ${result.reason}. ${result.suggestion || ""}`,
      });
    }

    // =========================
    // 📊 FETCH USER FINANCE
    // =========================
    const finance = await Finance.findOne({
      userId: session.user.id,
    });

    if (!finance) {
      return Response.json({
        reply: "I need your financial data first. Upload a statement.",
      });
    }

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

    // 🔥 LIMIT DATA (VERY IMPORTANT)
    const safeTransactions = allTransactions.slice(-100);

    // =========================
    // 🧠 SYSTEM PROMPT
    // =========================
    const systemPrompt = `
    You are MoneyMind — a behavioral finance AI.

    You have access to:
    1. User chat history
    2. Real transaction data

    Use REAL DATA when available. Be specific.

    RULES:
    - Max 2–3 sentences
    - Be sharp and slightly bold
    - Identify behavior patterns
    - Give 1 actionable fix
    - End with a question

    If no transaction data:
    → Ask user about their spending instead

    STRICT:
    - Plain text only
    - No markdown
    `;

    // =========================
    // 🧠 BUILD CONTEXT
    // =========================
    const transactionContext =
      safeTransactions.length > 0
        ? `User Transactions:\n${JSON.stringify(safeTransactions)}`
        : "No transaction data available";

    const chatHistory =
      history?.map((m: any) => ({
        role: m.type === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })) || [];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: transactionContext }],
        },
        ...chatHistory,
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 120,
      },
    });

    const text = result.response.text().trim();

    return Response.json({ reply: text });
  } catch (err) {
    console.error(err);
    return Response.json({ reply: "Something went wrong." }, { status: 500 });
  }
}
