"use server";

import Finance from "@/models/Finance";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";

import { explainScenario } from "@/lib/ai/explainScenario";

type Goal = {
  priority: "low" | "medium" | "high";
  title: string;
  targetAmount: number;
  status: "active" | "achieved" | "at-risk";
  notified70: boolean;
  deadline?: NativeDate | null | undefined;
  progress?: {
    savedAmount: number;
    percentage: number;
  };
};

export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const country = session.user.country ?? "India";

  const { scenarios } = await req.json();

  const finance = await Finance.findOne({ userId: session.user.id }).lean();

  if (!finance) {
    return Response.json({ error: "Finance not found" }, { status: 404 });
  }

  const transactions = finance.transactions || [];
  const goals = finance.goals || [];

  // =========================
  //  BASE CALCULATIONS
  // =========================
  const totalExpense = transactions
    .filter((t: any) => t.type === "Expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t: any) => t.type === "Income")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const currentSavings = totalIncome - totalExpense;

  const avgMonthlyExpense = totalExpense / 3 || 1;

  const monthlySavings = (finance.monthlyIncome || 0) - avgMonthlyExpense;

  // pick highest priority active goal
  const activeGoal = goals
    .filter((g: Goal) => g.status !== "achieved")
    .map((g: Goal) => {
      const priorityMap: any = { high: 3, medium: 2, low: 1 };

      // 📊 completion %
      const percentage =
        g.targetAmount > 0
          ? (g.progress?.savedAmount || 0) / g.targetAmount
          : 0;

      // ⏳ deadline urgency (in months)
      let urgencyScore = 0;
      if (g.deadline) {
        const monthsLeft =
          (new Date(g.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24 * 30);

        if (monthsLeft < 1) urgencyScore = 3;
        else if (monthsLeft < 3) urgencyScore = 2;
        else urgencyScore = 1;
      }

      // 🚨 status weight
      const statusScore = g.status === "at-risk" ? 4 : 2;

      // 🎯 final score
      const score =
        statusScore * 3 + // most important
        urgencyScore * 2 +
        priorityMap[g.priority] +
        percentage;

      return {
        ...g,
        _score: score,
      };
    })
    .sort((a: any, b: any) => b._score - a._score)[0];

  // =========================
  //  SCENARIO ENGINE
  // =========================
  const results = scenarios.map((s: any) => {
    let newSavings = currentSavings;
    let newMonthlyExpense = avgMonthlyExpense;
    let newMonthlySavings = monthlySavings;

    // =========================
    //  APPLY SCENARIO
    // =========================
    if (s.cost) {
      newSavings -= s.cost;
    }

    if (s.monthly) {
      newMonthlyExpense += s.monthly;
      newMonthlySavings -= s.monthly;
    }

    if (s.reduce) {
      newMonthlyExpense -= s.reduce;
      newMonthlySavings += s.reduce;
    }

    // prevent division issues
    if (newMonthlyExpense <= 0) newMonthlyExpense = 1;

    // =========================
    //  METRICS
    // =========================

    // 🔹 Survival months
    const survivalMonths = newSavings / newMonthlyExpense;

    // 🔹 Risk model
    let risk: "low" | "medium" | "high" = "low";

    if (country === "India") {
      if (newMonthlySavings <= 0 || survivalMonths < 2) risk = "high";
      else if (survivalMonths < 5) risk = "medium";
      else risk = "low";
    } else {
      // stricter for US/UK
      if (newMonthlySavings <= 0 || survivalMonths < 3) risk = "high";
      else if (survivalMonths < 6) risk = "medium";
      else risk = "low";
    }

    // 🔹 Net worth impact
    let netWorthImpact = 0;

    if (s.cost) {
      netWorthImpact = -s.cost;
    }

    if (s.monthly) {
      // treat as money being allocated into assets
      netWorthImpact = s.monthly;
    }

    if (s.reduce) {
      // extra savings gained
      netWorthImpact = s.reduce;
    }

    // =========================
    //  GOAL DELAY
    // =========================
    let goalDelay = 0;
    let goalStatus: "on-track" | "delayed" | "impossible" = "on-track";

    if (activeGoal) {
      const remaining =
        activeGoal.targetAmount - (activeGoal.progress?.savedAmount || 0);

      const currentRate = monthlySavings;
      const newRate = newMonthlySavings;

      // ❌ If user can't save at all
      if (newRate <= 0) {
        goalStatus = "impossible";
        goalDelay = Infinity;
      } else {
        const currentMonths =
          currentRate > 0 ? remaining / currentRate : Infinity;

        const newMonths = remaining / newRate;

        goalDelay = Math.round((newMonths - currentMonths) * 30);

        // =========================
        //  DEADLINE CHECK
        // =========================
        if (activeGoal.deadline) {
          const monthsLeft =
            (new Date(activeGoal.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24 * 30);

          if (newMonths > monthsLeft) {
            goalStatus = "delayed";
          }
        }
      }
    }

    const savingsChangePercent =
      ((newMonthlySavings - monthlySavings) / (monthlySavings || 1)) * 100;
    return {
      name: s.name,
      netWorthImpact: Math.round(netWorthImpact),

      stressRisk: risk,
      goalDelay: goalDelay === Infinity ? null : goalDelay,

      goalStatus,

      survivalMonths: Number(survivalMonths.toFixed(1)),
      monthlySavings: Math.round(newMonthlySavings),
      savingsChangePercent: Math.round(savingsChangePercent),
    };
  });

  // =========================
  //  AI EXPLANATION
  // =========================
  let explanation = "";

  try {
    explanation = await explainScenario(results, country);
  } catch (err) {
    console.error("AI explanation failed:", err);
  }

  return Response.json({
    results,
    explanation,
  });
}
