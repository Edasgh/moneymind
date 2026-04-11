export function canAfford({
  savings,
  price,
  monthlySavings,
}: {
  savings: number;
  price: number;
  monthlySavings: number;
}) {
  if (savings >= price) {
    return { decision: "YES", reason: "You can afford it now" };
  }

  const monthsNeeded = Math.ceil((price - savings) / monthlySavings);

  return {
    decision: "NO",
    reason: `You need ${monthsNeeded} months more`,
    suggestion: `Increase savings by ₹${Math.ceil((price - savings) / 6)}`,
  };
}
