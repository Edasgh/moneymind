import { currencyMap } from "./currencyMap";

export function simulateSavingsImpact(
  transactions: any[],
  snapshot: {
    income: number;
    totalSpent: number;
    savingsRate: number;
  },
  reductionAmount: number,
  country?: string,
) {
  const currency_str = currencyMap[country as keyof typeof currencyMap] || "₹";

  // =========================
  // CURRENT FINANCIALS
  // =========================

  const currentSpent = snapshot.totalSpent;

  const currentSavings = snapshot.income - snapshot.totalSpent;

  // =========================
  // CATEGORY ANALYSIS
  // =========================

  const expenseTransactions = transactions.filter((t) => t.type === "Expense");

  const categoryTotals: Record<string, number> = {};

  expenseTransactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // highest spending category
  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Lifestyle";

  // =========================
  // SIMULATION
  // =========================

  const newSpent = Math.max(currentSpent - reductionAmount, 0);

  const newSavings = snapshot.income - newSpent;

  const savingsGain = newSavings - currentSavings;

  const newSavingsRate = Math.round((newSavings / snapshot.income) * 100);

  // =========================
  // PROJECTED YEARLY IMPACT
  // =========================

  const yearlyImpact = savingsGain * 12;

  // =========================
  // SMART MESSAGE
  // =========================

  let insight = "";

  if (topCategory === "Lifestyle") {
    insight = "Most of your spending comes from lifestyle habits.";
  } else if (topCategory === "Impulsive") {
    insight = "Impulse spending is affecting long-term savings.";
  } else {
    insight = "Essential expenses dominate your monthly budget.";
  }

  return {
    currentSpent,
    newSpent,

    currentSavings,
    newSavings,

    savingsGain,
    yearlyImpact,

    topCategory,
    newSavingsRate,

    message: `${insight} Cutting ${currency_str}${reductionAmount}/month could raise your savings rate to ${newSavingsRate}% and add approximately ${currency_str}${yearlyImpact}/year in savings.`,
  };
}
