export function simulateSavingsImpact(
  transactions: any[],
  reductionAmount: number,
) {
  const currentSpent = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const newSpent = currentSpent - reductionAmount;

  const savingsGain = reductionAmount;

  return {
    newSpent,
    savingsGain,
    message: `You can save ₹${savingsGain}/month`,
  };
}
