import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// =========================
// 📊 GROUP BY MONTH
// =========================
function groupByMonth(transactions: any[]) {
  const map: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.type !== "Expense") return;

    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;

    map[key] = (map[key] || 0) + Number(t.amount);
  });

  return map;
}

// =========================
// 📊 CATEGORY SPLIT
// =========================
export function categorizeSpending(transactions: any[]) {
  let essential = 0;
  let lifestyle = 0;
  let impulsive = 0;

  transactions.forEach((t) => {
    if (t.type !== "Expense") return;

    const amount = Number(t.amount);

    if (t.category === "Essential") {
      essential += amount;
    } else if (t.category === "Lifestyle") {
      lifestyle += amount;
    } else if (t.category === "Impulsive") {
      impulsive += amount;
    }
  });

  return { essential, lifestyle, impulsive };
}

// =========================
// 📊 WEEKEND DETECTION
// =========================
function weekendSpendingBoost(transactions: any[]) {
  let weekend = 0;
  let total = 0;

  transactions.forEach((t) => {
    if (t.type !== "Expense") return;

    const day = new Date(t.date).getDay();

    total += Number(t.amount);

    if (day === 0 || day === 6) {
      weekend += Number(t.amount);
    }
  });

  if (total === 0) return 0;

  return weekend / total; // ratio
}

// =========================
// 📊 RECENT 30-DAY VELOCITY
// =========================
function last30DaysSpend(transactions: any[]) {
  const now = new Date();
  const last30 = new Date();
  last30.setDate(now.getDate() - 30);

  let total = 0;

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (t.type === "Expense" && d >= last30) {
      total += Number(t.amount);
    }
  });

  return total;
}

// =========================
// 📊 TREND MODEL
// =========================
function trendPrediction(transactions: any[]) {
  const monthly = groupByMonth(transactions);
  const months = Object.keys(monthly).sort().reverse().slice(0, 3);

  const weights = [0.5, 0.3, 0.2];

  let pred = 0;

  months.forEach((m, i) => {
    pred += (monthly[m] || 0) * weights[i];
  });

  return pred;
}

// =========================
// 🔮 MAIN FUNCTION
// =========================
export async function predictExpenseWithAI(context: any) {
  const tx = context.transactions || [];

  // =========================
  // 📊 BASE CALCULATIONS
  // =========================
  const trend = trendPrediction(tx);
  const last30 = last30DaysSpend(tx);
  const weekendRatio = weekendSpendingBoost(tx);
  const { essential, lifestyle, impulsive } = categorizeSpending(tx);

  // =========================
  // 📊 BASE
  // =========================
  let basePrediction = trend * 0.7 + last30 * 0.3;

  // =========================
  // 📊 CATEGORY METRICS
  // =========================
  const totalExpense = essential + lifestyle + impulsive;
  const impulsiveRatio = totalExpense ? impulsive / totalExpense : 0;

  // =========================
  // 📈 ADJUSTMENT FACTOR
  // =========================
  let adjustmentFactor = 1;

  // 🔥 Weekend behavior
  if (weekendRatio > 0.4) {
    adjustmentFactor += 0.05;
  }

  // 🎯 Goals (user trying to save)
  if (context.goals?.length) {
    adjustmentFactor -= 0.05;
  }

  // 🔥 High impulsive → risky
  if (impulsiveRatio > 0.35) {
    adjustmentFactor += 0.1;
  }

  // 🧠 Low impulsive → disciplined
  if (impulsiveRatio < 0.15) {
    adjustmentFactor -= 0.05;
  }

  // 🎯 Lifestyle heavy
  if (lifestyle > essential) {
    adjustmentFactor += 0.05;
  }

  // 🧱 Essential heavy → stable
  if (essential > lifestyle + impulsive) {
    adjustmentFactor -= 0.03;
  }

  // =========================
  // 🛡 CLAMP (VERY IMPORTANT)
  // =========================
  adjustmentFactor = Math.max(0.8, Math.min(1.25, adjustmentFactor));

  // If income is low but spending high → risk
  if (context.monthlyIncome && basePrediction > context.monthlyIncome * 0.9) {
    adjustmentFactor += 0.05;
  }

  // =========================
  // ✅ FINAL
  // =========================
  const finalPrediction = Math.round(basePrediction * adjustmentFactor);

  // =========================
  // 🤖 AI REFINEMENT
  // =========================
  const systemPrompt = `
You are an advanced financial prediction AI.

You are given:
- structured financial data
- a strong base prediction

Your job:
Refine slightly (NOT drastically)

Rules:
- Stay close to basePrediction
- Consider behavior patterns
- Keep realistic

Return STRICT JSON:
{
  "predictedExpense": number,
  "confidence": "low | medium | high",
  "reason": "short explanation"
}
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemPrompt,
  });

  const safeContext = {
    basePrediction: finalPrediction,
    monthlyIncome: context.monthlyIncome,
    essentialSpending: essential,
    lifestyleSpending: lifestyle,
    impulsiveSpending: impulsive,
    impulsiveRatio,
    weekendSpendingRatio: weekendRatio,
    recent30Days: last30,
    goals: context.goals,
  };

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: JSON.stringify(safeContext),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text = result.response
    .text()
    .replace(/```json|```/g, "")
    .trim();

  try {
    const ai = JSON.parse(text);

    // 🛡 SAFETY
    const diff = Math.abs(ai.predictedExpense - finalPrediction);

    if (diff > finalPrediction * 0.3) {
      return {
        predictedExpense: finalPrediction,
        confidence: "medium",
        reason: "Adjusted to recent behavioral trends",
      };
    }

    return ai;
  } catch (err) {
    return {
      predictedExpense: finalPrediction,
      confidence: "low",
      reason: "Fallback to advanced trend model",
    };
  }
}
