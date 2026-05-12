"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import { createNotification } from "@/lib/createNotification";
import { currencyMap } from "@/lib/currencyMap";
import { detectBehaviorCategoryAI } from "@/lib/ai/transactionCategorizer";

const BASE_URL = process.env.BASE_URL;
const SECRET = process.env.WORKER_SECRET;

export const POST = async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currency_str = currencyMap[session.user.country?.toString() as keyof typeof currencyMap] || "₹"

    const { amount, category, type, mode, date } = await request.json();

    await connectDB();

    const finance = await Finance.findOne({ userId: session.user.id });

    if (!finance) {
      return NextResponse.json(
        { error: "Finance doc not found" },
        { status: 404 },
      );
    }

    // =========================
    //  ADD TRANSACTION
    // =========================
    const detectedCategory=await detectBehaviorCategoryAI(category,type);
    const newTransaction = {
      amount: Number(amount),
      category:type==="Income"?"Income":detectedCategory,
      type,
      mode,
      date: new Date(date),
    };

    finance.transactions.push(newTransaction);

    // =========================
    //  GAMIFICATION ENGINE
    // =========================
    const game = finance.gamification || {
      level: 1,
      xp: 0,
      streaks: { underBudgetDays: 0 },
      achievements: [],
    };

    let xpGain = 0;

    // 🎯 XP RULES
    xpGain += 5; // adding transaction habit

    if (category) xpGain += 10;

    if (type === "Income") xpGain += 15;

    game.xp += xpGain;

    // =========================
    //  LEVEL SYSTEM
    // =========================
    const newLevel = Math.floor(game.xp / 100) + 1;

    if (newLevel > game.level) {
      game.level = newLevel;

      game.achievements.push({
        title: `⬆️ Reached Level ${newLevel}`,
        unlockedAt: new Date(),
      });

      await createNotification({
        userId: session.user.id,
        type: "LEVEL_UP",
        title: "🎉 Level Up!",
        message: `You reached Level ${newLevel}`,
      });
    }

    // =========================
    //  STREAK LOGIC
    // =========================
    const totalExpense = finance.transactions
      .filter((t: any) => t.type === "Expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalIncome = finance.transactions
      .filter((t: any) => t.type === "Income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const underBudget = totalIncome - totalExpense > 0;

    if (underBudget) {
      game.streaks.underBudgetDays = (game.streaks?.underBudgetDays || 0) + 1;
    } else {
      game.streaks.underBudgetDays = 0;
    }

    // =========================
    //  ACHIEVEMENTS
    // =========================
    const hasAchievement = (title: string) =>
      game.achievements.some((a: any) => a.title === title);

    if (
      finance.transactions.length === 1 &&
      !hasAchievement("🎉 First Transaction")
    ) {
      game.achievements.push({
        title: "🎉 First Transaction",
        unlockedAt: new Date(),
      });

      await createNotification({
        userId: session.user.id,
        type: "ACHIEVEMENT_UNLOCKED",
        title: "🏆 Achievement Unlocked",
        message: "🎉 First Transaction",
      });
    }

    if (type === "Income" && !hasAchievement("💰 First Income")) {
      game.achievements.push({
        title: "💰 First Income",
        unlockedAt: new Date(),
      });

      await createNotification({
        userId: session.user.id,
        type: "ACHIEVEMENT_UNLOCKED",
        title: "🏆 Achievement Unlocked",
        message: "💰 First Income",
      });
    }

    if (underBudget && !hasAchievement("💸 Under Budget Master")) {
      game.achievements.push({
        title: "💸 Under Budget Master",
        unlockedAt: new Date(),
      });

      await createNotification({
        userId: session.user.id,
        type: "ACHIEVEMENT_UNLOCKED",
        title: "🏆 Achievement Unlocked",
        message: "💸 Under Budget Master",
      });
    }

    if (
      game.streaks.underBudgetDays >= 5 &&
      !hasAchievement("🔥 5 Day Streak")
    ) {
      game.achievements.push({
        title: "🔥 5 Day Streak",
        unlockedAt: new Date(),
      });
      await createNotification({
        userId: session.user.id,
        type: "ACHIEVEMENT_UNLOCKED",
        title: "🏆 Achievement Unlocked",
        message: "🔥 5 Day Streak",
      });
    }

    if (underBudget && game.streaks.underBudgetDays > 0) {
      await createNotification({
        userId: session.user.id,
        type: "STREAK_UPDATE",
        title: "🔥 Streak Growing",
        message: `${game.streaks.underBudgetDays} days under budget!`,
      });
    }

    game.lastUpdated = new Date();

    finance.gamification = game;

    // =========================
    //  RESET FLAGS
    // =========================
    finance.flags.notifiedNoTransactions = false;

    await finance.save();

    await createNotification({
      userId: session.user.id,
      type: "TRANSACTION_ADDED",
      title: "💸 Transaction Added",
      message: `${currency_str}${amount} ${type.toLowerCase()} recorded`,
    });

    // const TRIGGER_AMOUNT = 1000; // adjust

    // if (
    //   newTransaction.amount >= TRIGGER_AMOUNT ||
    //   finance.latest_no_of_transactions <= 5
    // ) {
    //   // trigger analysis of finance
    //   await fetch(`${BASE_URL}/api/worker/analyze-finances?secret=${SECRET}`);
    // }

    return NextResponse.json(
      {
        message: "Transaction added",
        transactions: finance.transactions,
        gamification: finance.gamification,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to add transaction" },
      { status: 500 },
    );
  }
};


// update a manually added transaction
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const userId = session.user.id;

    const { amount, category, type, mode, date, transactionId } =
      await req.json();

    const finance = await Finance.findOne({ userId });

    if (!finance) {
      return NextResponse.json(
        { error: "No finance profile" },
        { status: 404 },
      );
    }

    // =========================
    //  FIND Transaction AND UPDATE
    // =========================
    await Finance.updateOne(
      { userId, "transactions._id": transactionId },
      {
        $set: {
          "transactions.$.type": type,
          "transactions.$.mode": mode,
          "transactions.$.category": category,
          "transactions.$.amount": Number(amount),
          "transactions.$.date": new Date(date),
        },
      },
    );

    // =========================
    //  DELTA CALCULATION
    // =========================
    const newAmount = amount;

    // =========================
    //  LIGHT GAMIFICATION
    // =========================
    if (!finance.gamification) {
      finance.gamification = {
        level: 1,
        xp: 0,
        streaks: { underBudgetDays: 0 },
        achievements: [],
      };
    }

    let xpChange = 0;

    // 🔹 Reward/Penalty logic
    if (type === "Income") {
      xpChange += Math.floor(newAmount / 200); // reward
    } else {
      xpChange -= Math.floor(newAmount / 500); // penalty
    }

    // 🔹 If type changed (important)
    // if (oldType !== txn.type) {
    //   xpChange += txn.type === "Income" ? 5 : -5;
    // }

    finance.gamification.xp += xpChange;

    // 🔹 LEVEL UPDATE
    finance.gamification.level = Math.floor(finance.gamification.xp / 100) + 1;

    // =========================
    //  SIMPLE ACHIEVEMENTS
    // =========================
    const achievements = finance.gamification.achievements || [];

    const hasAchievement = (title: string) =>
      achievements.some((a: any) => a.title === title);

    const unlock = (title: string) => {
      if (!hasAchievement(title)) {
        achievements.push({
          title,
          unlockedAt: new Date(),
        });
      }
    };

    if (finance.gamification.xp > 200) unlock("⚡ Getting Started");
    if (finance.gamification.xp > 500) unlock("💪 Consistent Tracker");

    finance.gamification.achievements = achievements;
    
    await finance.save();

    // const TRIGGER_AMOUNT = 1000; // adjust

    // if (
    //   newTransaction.amount >= TRIGGER_AMOUNT ||
    //   finance.latest_no_of_transactions <= 5
    // ) {
    //   // trigger analysis of finance
    //   await fetch(`${BASE_URL}/api/worker/analyze-finances?secret=${SECRET}`);
    // }

    return NextResponse.json(
      { message: "Transaction updated" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error while updating transaction:", error);

    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// delete a manually added transaction
export const DELETE = async (request: Request) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { transactionId } = await request.json();

    await connectDB();

    const finance = await Finance.findOne({ userId: session.user.id });

    if (!finance) {
      return NextResponse.json(
        { error: "No finance profile" },
        { status: 404 },
      );
    }

    // =========================
    //  DELETE TRANSACTION
    // =========================
    finance.transactions = finance.transactions.filter(
      (tx: any) => tx._id.toString() !== transactionId,
    );

    // =========================
    //  RECOMPUTE BASIC METRICS
    // =========================
    const txs = finance.transactions || [];

    const totalSpent = txs
      .filter((t: any) => t.type === "Expense")
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    const totalIncome = txs
      .filter((t: any) => t.type === "Income")
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    const savings = totalIncome - totalSpent;

    // =========================
    //  GAMIFICATION (SMART UPDATE)
    // =========================
    if (!finance.gamification) {
      finance.gamification = {
        level: 1,
        xp: 0,
        streaks: { underBudgetDays: 0 },
        achievements: [],
      };
    }

    let achievements = finance.gamification.achievements || [];

    //  REMOVE invalid achievements (rare but correct)
    achievements = achievements.filter((a: any) => {
      if (a.title === "💰 Smart Saver" && savings < 5000) return false;
      if (a.title === "🔥 Budget Master" && !(totalSpent < totalIncome * 0.7))
        return false;
      return true;
    });

    //  RE-ADD achievements if conditions satisfied
    if (
      savings > 5000 &&
      !achievements.find((a: any) => a.title === "💰 Smart Saver")
    ) {
      achievements.push({
        title: "💰 Smart Saver",
        unlockedAt: new Date(),
      });
    }

    if (
      totalSpent < totalIncome * 0.7 &&
      !achievements.find((a: any) => a.title === "🔥 Budget Master")
    ) {
      achievements.push({
        title: "🔥 Budget Master",
        unlockedAt: new Date(),
      });
    }

    finance.gamification.achievements = achievements;
    finance.gamification.lastUpdated = new Date();

    await finance.save();

    // =========================
    //  OPTIONAL: TRIGGER AI (ASYNC)
    // =========================
    // fetch(`${BASE_URL}/api/worker/analyze-finances?secret=${SECRET}`).catch(
    //   () => {},
    // );

    return NextResponse.json(
      {
        message: "Transaction deleted",
        transactions: finance.transactions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
};
