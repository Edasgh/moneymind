"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import Statement from "@/models/Statement";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const gemini_apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_apiKey!!);

export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ question: "Unauthorized" }, { status: 401 });
  }

  const { history, mode } = await req.json();

  const chatHistory = history
    ?.map((m: any) => `${m.type === "user" ? "User" : "AI"}: ${m.text}`)
    .join("\n");

  const isBeginner =
    (history?.length || 0) < 3 ||
    !history?.some((m: any) =>
      /(invest|sip|mutual fund|credit|loan|interest|budget)/i.test(m.text),
    );

  // =========================
  // PROMPT
  // =========================
  let systemPrompt = "";

  const PERSONAL_PROMPT = `
    You are MoneyMind, a sharp financial behavior coach.

    Your job:
    Ask a follow-up question that reveals WHY the user behaves this way.

    Focus on:
    - Spending habits
    - Emotional triggers (stress, boredom, impulse)
    - Patterns in transactions

    STRICT RULES:
    - Only ONE sentence
    - No explanations
    - No markdown
    - No emojis
    - Make it feel personal and insightful
    - If no data, ask about habits instead

    Examples:
    - What usually triggers your late-night spending?
    - Do you notice yourself ordering more when stressed or bored?
    `;

  const GENERAL_BEGINNER_PROMPT = `
  You are MoneyMind, a beginner-friendly financial guide.

  Your job:
  Ask a VERY simple follow-up question to understand the user's money habits.

  Focus on:
  - Daily money usage
  - Saving habits
  - Basic banking awareness

  STRICT RULES:
  - Only ONE sentence
  - Use very simple words (no jargon)
  - Make it easy to answer (yes/no or short)
  - No markdown
  - No emojis

  STYLE:
  - Talk like a helpful friend
  - Assume user is new to finance

  Examples:
  - Do you usually save some money every month?
  - Do you keep your money in a bank account or cash?
  - Do you track your daily expenses?
  `;

  const GENERAL_ADVANCED_PROMPT = `
  You are MoneyMind, a financial literacy and inclusion guide.

  Your job:
  Ask a thoughtful follow-up question to understand the user's financial thinking.

  Focus on:
  - Saving and budgeting
  - Financial habits
  - Risk awareness
  - Basic investing

  STRICT RULES:
  - Only ONE sentence
  - Keep language simple but slightly insightful
  - No markdown
  - No emojis

  Examples:
  - What percentage of your income do you try to save?
  - Do you have a plan for handling unexpected expenses?
  - How do you decide between spending and saving?
  `;

  if (mode === "personal") {
    systemPrompt = PERSONAL_PROMPT;
  } else {
    systemPrompt = isBeginner
      ? GENERAL_BEGINNER_PROMPT
      : GENERAL_ADVANCED_PROMPT;
  }

  //=========================
  // MODEL
  //==========================
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemPrompt,
  });

  let context = ``;

  if (mode === "personal") {
    // =========================
    //  FETCH DATA
    // =========================
    const finance = await Finance.findOne({
      userId: session.user.id,
    });

    if (!finance) {
      return Response.json({
        question: "I need your financial data first. Upload a statement.",
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

    const safeTransactions = allTransactions.slice(-100);

    context =
      safeTransactions.length > 0
        ? `Transactions:\n${JSON.stringify(safeTransactions)}`
        : "No transaction data";
  } else {
    context = "No transaction data";
  }

  try {
    const result = await model.generateContent(`
  ${context}

  ${chatHistory}

  Ask a follow-up question.
  `);

    const text = result.response.text().trim();

    if (!text) {
      return Response.json({
        question: "What usually triggers your unnecessary spending?",
      });
    }

    return Response.json({ question: text });
  } catch (error) {
    console.log("Error while ai asking follow up : ",error);
    return Response.json({ question: "Something went wrong! Please try again later." });
  }
}
