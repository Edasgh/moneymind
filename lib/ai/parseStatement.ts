import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStatementConfidence } from "@/lib/statementParseHelpers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

Detect type correctly:
- money received / salary / refund / credited → Income
- money spent / debited / payment → Expense

Category rules:
- Groceries, rent, medical, fuel, utilities, bills → Essential
- Netflix, subscriptions, dining, shopping, entertainment → Lifestyle
- Random online shopping, late-night food, emotional spending → Impulsive

Mode MUST be ONLY one of these EXACT values:
- UPI
- Card
- Cash
- Bank

STRICT MODE RULES:
- Never invent a new mode
- Never return Wallet, NetBanking, Transfer, ATM, Debit Card, Credit Card, IMPS, NEFT, Others etc.
- Debit/Credit cards → Card
- UPI apps/payments → UPI
- ATM withdrawals → Cash
- Bank transfer / NEFT / IMPS / salary credit → Bank

Return ONLY valid JSON array.
No markdown.
No explanation.

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

export async function parseStatementWithAI(stmt: any) {
  // =========================
  //  FETCH FILE
  // =========================
  const fileRes = await fetch(stmt.fileUrl);
  const arrayBuffer = await fileRes.arrayBuffer();

  let text = "";

  if (stmt.type === "pdf") {
    const pdf = (await import("pdf-parse")).default;
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf(buffer);

    text = data.text;
  } else {
    text = await new Response(arrayBuffer).text();
  }

  // =========================
  //  CLEAN TEXT
  // =========================
  const lines = text.split("\n").filter((l) => l.trim());
  const safeText = lines.slice(0, 500).join("\n");

  // =========================
  //  VALIDATION (SAVE TOKENS)
  // =========================
  const confidence = getStatementConfidence(safeText);

  if (confidence < 4) {
    throw new Error("Not a valid bank statement");
  }

  // =========================
  //  GEMINI
  // =========================
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemprompt,
  });

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
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    transactions = JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new Error("AI JSON parse failed");
  }

  return {
    transactions,
    rawText: text,
  };
}
