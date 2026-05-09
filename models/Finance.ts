import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },

  category: {
    type: String,
    enum: ["Essential", "Lifestyle", "Impulsive", "Income"],
    default: "Lifestyle",
  },

  type: {
    type: String,
    enum: ["Income", "Expense"],
    required: true,
  },

  mode: {
    type: String,
    enum: ["UPI", "Card", "Cash", "Bank"],
    default: "UPI",
  },

  date: { type: Date, required: true },
});

// =========================
// 🎯 GOALS
// =========================
const GoalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    targetAmount: { type: Number, required: true },

    deadline: Date,

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    progress: {
      savedAmount: { type: Number, default: 0 },

      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    status: {
      type: String,
      enum: ["active", "achieved", "at-risk"],
      default: "active",
    },

    notified70: { type: Boolean, default: false },
  },
  { timestamps: true },
);

GoalSchema.virtual("percentage").get(function () {
  if (!this || !this.targetAmount || !this.progress?.savedAmount) return 0;

  return (this.progress.savedAmount / this.targetAmount) * 100;
});

GoalSchema.set("toJSON", { virtuals: true });
GoalSchema.set("toObject", { virtuals: true });

// =========================
// 💰 FINANCE
// =========================
const FinanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ⚡ important
    },

    monthlyIncome: { type: Number, default: 0 },

    transactions: [transactionSchema],

    statements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Statement",
      },
    ],

    // =========================
    // 🧠 AI MEMORY
    // =========================
    aiHistory: [
      {
        score: { type: Number, min: 0, max: 100 },

        personality: String,

        insights: [
          {
            text: String,
            type: {
              type: String,
              enum: ["risk", "habit", "opportunity"],
            },
          },
        ],

        fixes: [
          {
            action: String,
            priority: {
              type: String,
              enum: ["low", "medium", "high"],
            },
          },
        ],

        impact: {
          savingsPotential: Number,
          projectedSavings: Number,
          riskLevel: {
            type: String,
            enum: ["low", "medium", "high"],
          },
        },

        snapshot: {
          income: Number,
          totalSpent: Number,
          savingsRate: Number,
        },

        createdAt: { type: Date, default: Date.now },
      },
    ],

    // =========================
    // 🎯 GOALS
    // =========================
    goals: [GoalSchema],

    flags: {
      notifiedNoStatements: { type: Boolean, default: false },
      notifiedNoTransactions: { type: Boolean, default: false },
    },

    prediction: {
      nextMonthExpense: Number,
      confidence: String,
      reason: String,
    },

    breakdown: {
      essential: { type: Number, default: 0 },
      lifestyle: { type: Number, default: 0 },
      impulsive: { type: Number, default: 0 },
      updatedAt: { type: Date },
    },

    lifeMetrics: {
      financialStabilityScore: { type: Number, min: 0, max: 100 },

      survivalMonths: Number, // months user can survive without income

      stressRisk: {
        type: String,
        enum: ["low", "medium", "high"],
      },

      savingsRate: Number,

      emergencyFundStatus: {
        type: String,
        enum: ["poor", "average", "good"],
      },

      updatedAt: Date,
    },

    gamification: {
      level: { type: Number, default: 1 },

      xp: { type: Number, default: 0 },

      streaks: {
        underBudgetDays: { type: Number, default: 0 },
      },

      achievements: [
        {
          title: String,
          unlockedAt: Date,
        },
      ],

      lastUpdated: Date,
    },

    latest_no_of_transactions: Number,
  },
  { timestamps: true },
);

// =========================
// ⚡ INDEXES (IMPORTANT)
// =========================
FinanceSchema.index({ userId: 1, "transactions.date": -1 });

export default mongoose.models.Finance ||
  mongoose.model("Finance", FinanceSchema);
