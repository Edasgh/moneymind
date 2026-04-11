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

  const { history } = await req.json();

  // =========================
  // 📊 FETCH DATA
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

  // =========================
  // 🧠 PROMPT
  // =========================
  const systemPrompt = `
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
  const context =
    safeTransactions.length > 0
      ? `Transactions:\n${JSON.stringify(safeTransactions)}`
      : "No transaction data";

  const chatHistory = history
    ?.slice(-8)
    .map((m: any) => `${m.type === "user" ? "User" : "AI"}: ${m.text}`)
    .join("\n");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemPrompt,
  });

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
}
