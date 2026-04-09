"use server";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import Statement from "@/models/Statement";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);


export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ reply: "Unauthorized" }, { status: 401 });
    }

    const { message, history } = await req.json();

    // =========================
    // 📊 FETCH USER FINANCE
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
      history?.slice(-6).map((m: any) => ({
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
