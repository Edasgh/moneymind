"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import Statement from "@/models/Statement";
import { getServerSession } from "next-auth";

const gemini_apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_apiKey!!);


export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession();
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

  let allTransactions: any[] = [];

  if (finance?.statements?.length) {
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
You are MoneyMind.

Ask ONE follow-up question based on:
- User behavior
- Transaction patterns (if available)

Focus on triggers (impulse, stress, habit)

RULES:
- One sentence
- Personal
- Sharp
- No markdown
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

  return Response.json({ question: text });
}
