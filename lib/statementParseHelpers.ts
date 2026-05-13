import { z } from "zod";

// =========================
//  NORMALIZE TRANSACTIONS
// =========================
export function normalizeTransactions(transactions: any[]) {
  return transactions
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      date: t.date ? new Date(t.date) : new Date(),
      amount: Math.abs(Number(t.amount) || 0),
      category:
        t.type === "Income"
          ? "Income"
          : ["Essential", "Lifestyle", "Impulsive"].includes(t.category)
            ? t.category
            : "Lifestyle",
      mode: ["UPI", "Card", "Cash", "Bank"].includes(t.mode) ? t.mode : "UPI",
      type: t.type === "Income" ? "Income" : "Expense",
    }))
    .filter((t) => t.date && !isNaN(t.date.getTime())); // remove invalid dates
}

// =========================
//  SUMMARY GENERATOR
// =========================
export function generateSummary(normalized: any[]) {
  const totalSpent = normalized
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = normalized
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryMap: Record<string, number> = {};

  normalized.forEach((t) => {
    if (t.type === "Expense") {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
  });

  const topCategory =
    Object.keys(categoryMap).sort(
      (a, b) => categoryMap[b] - categoryMap[a],
    )[0] || "None";

  return {
    totalSpent,
    totalIncome,
    topCategory,
  };
}

// export function getSpendingPersonality(summary: any) {
//   if (summary.impulsive > summary.essential) return "⚡ Impulsive Spender";

//   if (summary.lifestyle > summary.essential) return "🎯 Lifestyle Lover";

//   return "🧠 Balanced Planner";
// }

export function getStatementConfidence(text: string) {
  let score = 0;
  const lower = text.toLowerCase();

  if (lower.includes("account")) score += 1;
  if (lower.includes("balance")) score += 1;
  if (lower.includes("debit")) score += 1;
  if (lower.includes("credit")) score += 1;
  if (/\d{2}[-/]\d{2}[-/]\d{4}/.test(text)) score += 2;
  if (/\b\d+\.\d{2}\b/.test(text)) score += 2;

  return score;
}

// =========================
// ENUMS
// =========================
const InsightType = z.enum(["risk", "habit", "opportunity"]);
const PriorityType = z.enum(["low", "medium", "high"]);
const RiskLevel = z.enum(["low", "medium", "high"]);

// =========================
// HELPERS
// =========================
const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const safeNumber = (val: any, fallback = 0) => {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

// =========================
// SCHEMA
// =========================
const InsightSchema = z.object({
  text: z.string().min(1).max(200),
  type: InsightType,
});

const FixSchema = z.object({
  action: z.string().min(1).max(200),
  priority: PriorityType,
});

const AIResponseSchema = z.object({
  score: z.number().int().min(0).max(100),

  personality: z.string().min(1).max(50),

  insights: z.array(InsightSchema).max(5),

  fixes: z.array(FixSchema).max(5),

  impact: z.object({
    savingsPotential: z.number().min(0),
    projectedSavings: z.number().min(0),
    riskLevel: RiskLevel,
  }),

  snapshot: z.object({
    income: z.number(),
    totalSpent: z.number(),
    savingsRate: z.number(),
  }),
});

// =========================
//  MAIN PARSER
// =========================
export function safeParseAI(input: any) {
  try {
    //   Normalize
    let data = typeof input === "string" ? JSON.parse(input) : input;

    //  Fix stringified arrays
    if (typeof data.insights === "string") {
      try {
        data.insights = JSON.parse(data.insights);
      } catch {
        data.insights = [];
      }
    }

    if (typeof data.fixes === "string") {
      try {
        data.fixes = JSON.parse(data.fixes);
      } catch {
        data.fixes = [];
      }
    }

    // CLEAN ARRAYS

    const cleanInsights = Array.isArray(data.insights)
      ? data.insights
          .map((i: any) => {
            const text = String(i?.text || "")
              .trim()
              .slice(0, 200);

            if (!text) return null; // remove empty

            return {
              text,
              type: ["risk", "habit", "opportunity"].includes(i?.type)
                ? i.type
                : "habit",
            };
          })
          .filter(
            (
              i: any,
            ): i is { text: string; type: "risk" | "habit" | "opportunity" } =>
              i !== null,
          )
          .slice(0, 5)
      : [];

    const cleanFixes = Array.isArray(data.fixes)
      ? data.fixes
          .map((f: any) => {
            const action = String(f?.action || "")
              .trim()
              .slice(0, 200);

            if (!action) return null; // remove empty

            return {
              action,
              priority: ["low", "medium", "high"].includes(f?.priority)
                ? f.priority
                : "low",
            };
          })
          .filter(
            (
              f: any,
            ): f is {
              action: string;
              priority: "low" | "medium" | "high";
            } => f !== null,
          )
          .slice(0, 5)
      : [];

    //  FINAL OBJECT

    const cleaned = {
      score: clamp(safeNumber(data.score), 0, 100),

      personality: String(data.personality || "Balanced").slice(0, 50),

      insights: cleanInsights,

      fixes: cleanFixes,

      impact: {
        savingsPotential: Math.max(
          0,
          safeNumber(data?.impact?.savingsPotential),
        ),
        projectedSavings: Math.max(
          0,
          safeNumber(data?.impact?.projectedSavings),
        ),
        riskLevel: ["low", "medium", "high"].includes(data?.impact?.riskLevel)
          ? data.impact.riskLevel
          : "medium",
      },

      snapshot: {
        income: Math.max(0, safeNumber(data?.snapshot?.income)),
        totalSpent: Math.max(0, safeNumber(data?.snapshot?.totalSpent)),
        savingsRate: clamp(safeNumber(data?.snapshot?.savingsRate), 0, 100),
      },
    };

    //  VALIDATE

    console.log("From statement parser : \n", AIResponseSchema.parse(cleaned));
    return AIResponseSchema.parse(cleaned);
  } catch (err) {
    console.error("❌ safeParseAI failed:", err);

    //  FALLBACK (never crash)

    return {
      score: 50,
      personality: "Balanced",

      insights: [],
      fixes: [],

      impact: {
        savingsPotential: 0,
        projectedSavings: 0,
        riskLevel: "medium",
      },

      snapshot: {
        income: 0,
        totalSpent: 0,
        savingsRate: 0,
      },
    };
  }
}
