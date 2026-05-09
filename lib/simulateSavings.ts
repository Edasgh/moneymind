import { currencyMap } from "./currencyMap";

export function simulateSavingsImpact(
  transactions: any[],
  reductionAmount: number,
  country?:string,
) {
  const currentSpent = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const newSpent = currentSpent - reductionAmount;

  const savingsGain = reductionAmount;

    const currency_str =
        currencyMap[country as keyof typeof currencyMap] || "₹"

  return {
    newSpent,
    savingsGain,
    message: `You can save ${currency_str}${savingsGain}/month`,
  };
}
