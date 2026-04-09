"use server";

import { getStatementConfidence } from "@/lib/statementParser";
import { connectDB } from "@/lib/db";
import Statement from "@/models/Statement";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  await connectDB();
  const { statementId } = await request.json(); // only ID

  const systemprompt = `
  You are a financial behavior analyzer.

  Classify each transaction into ONLY these categories:
  - Essential (needs)
  - Lifestyle (planned wants)
  - Impulsive (unplanned / emotional)

  STRICT Rules:
  - Extract ONLY real transactions
  - Ignore headers, totals, balances
  - Normalize all dates to YYYY-MM-DD
  - Amount must be positive number
  - Detect type correctly:
    - money in → Income
    - money out → Expense

  - Groceries, rent, bills → Essential
  - Netflix, dining, shopping → Lifestyle
  - Late-night food, random shopping → Impulsive

  Return ONLY valid JSON array.
  No markdown. No explanation.

  [
    {
      "date": "YYYY-MM-DD",
      "amount": number,
      "category": "Essential | Lifestyle | Impulsive",
      "mode": "UPI | Card | Cash | Bank",
      "type": "Income | Expense"
    }
  ]
  `;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemprompt,
  });

  try {
    // =========================
    // 🧾 1. GET STATEMENT
    // =========================
    const statement = await Statement.findById(statementId);

    if (!statement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Statement.findByIdAndUpdate(statementId, {
      status: "processing",
    });

    // =========================
    // 📄 2. FETCH FILE
    // =========================
    const fileRes = await fetch(statement.fileUrl);
    const arrayBuffer = await fileRes.arrayBuffer();

    let text = "";

    // =========================
    // 📄 3. EXTRACT TEXT
    // =========================
    if (statement.type === "pdf") {
      const buffer = Buffer.from(arrayBuffer);
      const parsePdf = new PDFParse({ data: buffer });
      const data = await parsePdf.getText();
      text = data.text;
    } else {
      text = await new Response(arrayBuffer).text();
    }

    // safer slicing (avoid breaking rows)
    const lines = text.split("\n").filter((line) => line.trim().length > 0); // remove empty

    const safeText = lines.slice(0, 500).join("\n");

    const confidence = getStatementConfidence(safeText);

    if (confidence < 4) {
      throw new Error("Not a valid document!");
    }

    // =========================
    // 🤖 4. GEMINI CALL
    // =========================
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `Bank Statement:\n${safeText}` }],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const raw = result.response.text();
    let transactions: any[] = [];

    try {
      const jsonStart = raw.indexOf("[");
      const jsonEnd = raw.lastIndexOf("]");

      const jsonString = raw.slice(jsonStart, jsonEnd + 1);

      transactions = JSON.parse(jsonString);
    } catch (err) {
      console.error("Parsing failed:", err);
    }

    // =========================
    // 🧠 5. NORMALIZE
    // =========================
    const normalized = transactions
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        date: t.date ? new Date(t.date) : new Date(),
        amount: Math.abs(Number(t.amount) || 0),
        category: ["Essential", "Lifestyle", "Impulsive"].includes(t.category)
          ? t.category
          : "Lifestyle",
        mode: t.mode || "UPI",
        type: t.type === "Income" ? "Income" : "Expense",
      }))
      .filter((t) => t.date && !isNaN(t.date.getTime())); // ✅ remove invalid dates

    const now = new Date();
    const sixMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 6,
      now.getDate(),
    );

    let filtered = normalized.filter((t) => t.date && t.date >= sixMonthsAgo);

    // FALLBACK
    if (filtered.length === 0) {
      console.log("No recent data, using latest transactions instead");

      filtered = [...normalized]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 100); // or 300
    }

    const sorted = filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    // =========================
    // 📊 6. SUMMARY
    // =========================
    const summary = {
      essential: 0,
      lifestyle: 0,
      impulsive: 0,
    };

    sorted.forEach((t) => {
      if (t.type === "Expense") {
        const key = t.category.toLowerCase() as keyof typeof summary;
        summary[key] += t.amount;
      }
    });

    // ✅ FIXED: use normalized (NOT transactions)
    const totalSpent = sorted
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = sorted
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryMap: any = {};
    sorted.forEach((t) => {
      if (t.type === "Expense") {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    const topCategory =
      Object.keys(categoryMap).sort(
        (a, b) => categoryMap[b] - categoryMap[a],
      )[0] || "None";

    const formattedTransactions = sorted.map((t) => ({
      date: t.date, // already Date object
      amount: t.amount,
      category: t.category,
      mode: t.mode,
      type: t.type,
    }));

    // =========================
    // 💾 7. SAVE
    // =========================
    await Statement.findByIdAndUpdate(statementId, {
      status: "parsed",
      parsingMeta: {
        rawText: text.slice(0, 5000),
      },
      extractedTransactions: formattedTransactions,
      summary: {
        totalSpent,
        totalIncome,
        topCategory,
      },
      isAICategorized: true,
    });

    // =========================
    // 📤 8. RESPONSE
    // =========================
    return NextResponse.json(
      {
        transactions: normalized,
        summary,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Gemini parsing error:", err);

    await Statement.findByIdAndUpdate(statementId, {
      status: "failed",
      parsingMeta: {
        errors: ["AI parsing failed"],
      },
    });

    return NextResponse.json(
      {
        transactions: [],
        summary: {
          essential: 0,
          lifestyle: 0,
          impulsive: 0,
        },
      },
      { status: 500 },
    );
  }
}
