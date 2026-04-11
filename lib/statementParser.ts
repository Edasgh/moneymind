// =========================
// 🧠 NORMALIZE TRANSACTIONS
// =========================
export function normalizeTransactions(transactions: any[]) {
  return transactions
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
    .filter((t) => t.date && !isNaN(t.date.getTime())); // remove invalid dates
}

// =========================
// 📊 SUMMARY GENERATOR
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

export function getSpendingPersonality(summary: any) {
  if (summary.impulsive > summary.essential) return "⚡ Impulsive Spender";

  if (summary.lifestyle > summary.essential) return "🎯 Lifestyle Lover";

  return "🧠 Balanced Planner";
}

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
