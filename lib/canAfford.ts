import { currencyMap } from "./currencyMap";

export function canAfford({
  savings,
  price,
  monthlySavings,
  country,
}: {
  savings: number;
  price: number;
  monthlySavings: number;
  country?:string;
}) {
  if (savings >= price) {
    return { decision: "YES", reason: "You can afford it now" };
  }

  const monthsNeeded = Math.ceil((price - savings) / monthlySavings);

    const currency_str =
        currencyMap[country as keyof typeof currencyMap] || "₹"

  return {
    decision: "NO",
    reason: `You need ${monthsNeeded} months more`,
    suggestion: `Increase savings by ${currency_str}${Math.ceil((price - savings) / 6)}`,
  };
}
