export const fullDemoData = {
  student: {
    monthlyIncome: 27000,

    transactions: [
      // =========================
      //  STUDENT
      // =========================

      // -------------------------
      //  INCOME
      // Total Income = 25000
      // -------------------------
      {
        amount: 18000,
        category: "Income",
        type: "Income",
        mode: "Bank",
        date: new Date("2026-05-01"),
      },

      // part-time / freelance income
      {
        amount: 7000,
        category: "Income",
        type: "Income",
        mode: "UPI",
        date: new Date("2026-05-04"),
      },

      // =========================
      //  ESSENTIAL EXPENSES
      // Target Total = 9000
      // =========================

      // hostel / rent
      {
        amount: 3200,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-05"),
      },

      // groceries
      {
        amount: 1800,
        category: "Essential",
        type: "Expense",
        mode: "Cash",
        date: new Date("2026-05-07"),
      },

      // books + study materials
      {
        amount: 1500,
        category: "Essential",
        type: "Expense",
        mode: "Bank",
        date: new Date("2026-05-09"),
      },

      // transport
      {
        amount: 1200,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-11"),
      },

      // mobile + internet
      {
        amount: 1300,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-13"),
      },

      // =========================
      //  LIFESTYLE EXPENSES
      // Target Total = 7000
      // food delivery + entertainment
      // =========================

      // food delivery
      {
        amount: 2200,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-06"),
      },

      // movie + cafe
      {
        amount: 1600,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-08"),
      },

      // gaming / subscriptions
      {
        amount: 1200,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-10"),
      },

      // outings
      {
        amount: 1100,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-12"),
      },

      // snacks + entertainment
      {
        amount: 900,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-14"),
      },

      // =========================
      //  IMPULSIVE EXPENSES
      // Target Total = 2500
      // =========================

      // impulse gadget purchase
      {
        amount: 1500,
        category: "Impulsive",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-15"),
      },

      // online shopping
      {
        amount: 1000,
        category: "Impulsive",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-16"),
      },
      // extra scholarship income
      {
        amount: 2000,
        category: "Income",
        type: "Income",
        mode: "Bank",
        date: new Date("2026-05-18"),
      },

      // additional lifestyle expense (food delivery)
      {
        amount: 2000,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-19"),
      },
    ],

    statements: [],

    aiHistory: [
      {
        score: 74,

        personality: "Disciplined Learner",

        insights: [
          {
            text: "Food delivery and entertainment expenses are rising faster than savings.",
            type: "habit",
          },

          {
            text: "Part-time income creates good early financial independence.",
            type: "opportunity",
          },

          {
            text: "Emergency savings are still too low for unexpected expenses.",
            type: "risk",
          },
        ],

        fixes: [
          {
            action: "Reduce food delivery spending by setting a weekly limit.",
            priority: "high",
          },

          {
            action: "Automate ₹2000 monthly savings into a separate account.",
            priority: "medium",
          },

          {
            action: "Avoid impulse gadget purchases for the next 3 months.",
            priority: "medium",
          },
        ],

        impact: {
          savingsPotential: 3500,
          projectedSavings: 20000,
          riskLevel: "medium",
        },

        snapshot: {
          income: 27000,
          totalSpent: 20500,
          savingsRate: 24,
        },

        createdAt: new Date(),
      },
    ],

    goals: [
      {
        title: "Buy MacBook",
        targetAmount: 90000,

        deadline: new Date("2027-01-01"),

        priority: "high",

        progress: {
          savedAmount: 18000,
          percentage: 20,
        },

        status: "active",

        notified70: false,
      },

      {
        title: "Emergency Fund",
        targetAmount: 30000,

        deadline: new Date("2026-10-01"),

        priority: "medium",

        progress: {
          savedAmount: 10000,
          percentage: 33,
        },

        status: "active",

        notified70: false,
      },
    ],

    flags: {
      notifiedNoStatements: false,
      notifiedNoTransactions: false,
    },

    prediction: {
      nextMonthExpense: 21000,
      confidence: "medium",
      reason:
        "Food delivery and entertainment spending are gradually increasing.",
    },

    breakdown: {
      essential: 9000,
      lifestyle: 9000,
      impulsive: 2500,
      updatedAt: new Date(),
    },

    lifeMetrics: {
      financialStabilityScore: 64,
      survivalMonths: 3.1,
      stressRisk: "medium",
      savingsRate: 24,
      emergencyFundStatus: "average",
      updatedAt: new Date(),
    },

    gamification: {
      level: 2,

      xp: 120,

      streaks: {
        underBudgetDays: 9,
      },

      achievements: [
        {
          title: "💸 Budget Beginner",
          unlockedAt: new Date(),
        },

        {
          title: "📈 Savings Starter",
          unlockedAt: new Date(),
        },
      ],

      lastUpdated: new Date(),
    },

    latest_no_of_transactions: 16,
  },

  professional: {
    monthlyIncome: 85000,
    transactions: [
      // =========================
      //  YOUNG PROFESSIONAL
      // =========================

      // -------------------------
      //  INCOME
      // Total Income = 85000
      // -------------------------
      {
        amount: 85000,
        category: "Income",
        type: "Income",
        mode: "Bank",
        date: new Date("2026-05-01"),
      },

      // =========================
      //  ESSENTIAL EXPENSES
      // Target Total = 28000
      // ==========================

      // rent
      {
        amount: 18000,
        category: "Essential",
        type: "Expense",
        mode: "Bank",
        date: new Date("2026-05-02"),
      },

      // groceries
      {
        amount: 3500,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-03"),
      },

      // transport
      {
        amount: 1800,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-04"),
      },

      // electricity
      {
        amount: 2200,
        category: "Essential",
        type: "Expense",
        mode: "Cash",
        date: new Date("2026-05-05"),
      },

      // internet + mobile bill
      {
        amount: 1500,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-06"),
      },

      // fuel
      {
        amount: 1000,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-15"),
      },

      // SIP investment
      {
        amount: 5000,
        category: "Essential",
        type: "Expense",
        mode: "Bank",
        date: new Date("2026-05-25"),
      },

      // =========================
      //  LIFESTYLE EXPENSES
      // Target Total = 18000
      // =========================

      // dining
      {
        amount: 5000,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-07"),
      },

      // subscriptions
      {
        amount: 2500,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-08"),
      },

      // outings
      {
        amount: 4200,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-09"),
      },

      // shopping + cafes
      {
        amount: 3300,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-10"),
      },

      // weekend trip
      {
        amount: 3000,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-11"),
      },

      // =========================
      //  IMPULSIVE EXPENSES
      // Target Total = 6000
      // =========================

      // online shopping
      {
        amount: 2000,
        category: "Impulsive",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-12"),
      },

      // gadget accessory
      {
        amount: 2500,
        category: "Impulsive",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-13"),
      },

      // late-night impulse buy
      {
        amount: 1500,
        category: "Impulsive",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-14"),
      },
    ],

    statements: [],

    aiHistory: [
      {
        score: 82,

        personality: "Growth Focused Planner",

        insights: [
          {
            text: "Strong savings rate but lifestyle inflation is increasing.",
            type: "habit",
          },

          {
            text: "Monthly SIP investments are creating long-term stability.",
            type: "opportunity",
          },

          {
            text: "Frequent online shopping may slow down travel goals.",
            type: "risk",
          },
        ],

        fixes: [
          {
            action:
              "Increase SIP contribution by 10% after annual salary increments.",
            priority: "medium",
          },

          {
            action: "Set a monthly discretionary spending cap.",
            priority: "high",
          },
        ],

        impact: {
          savingsPotential: 10000,
          projectedSavings: 120000,
          riskLevel: "low",
        },

        snapshot: {
          income: 85000,
          totalSpent: 57000,
          savingsRate: 33,
        },

        createdAt: new Date(),
      },
    ],

    goals: [
      {
        title: "Europe Trip",
        targetAmount: 250000,

        deadline: new Date("2027-06-01"),

        priority: "medium",

        progress: {
          savedAmount: 80000,
          percentage: 32,
        },

        status: "active",

        notified70: false,
      },

      {
        title: "Emergency Fund",
        targetAmount: 500000,

        deadline: new Date("2028-01-01"),

        priority: "high",

        progress: {
          savedAmount: 140000,
          percentage: 28,
        },

        status: "active",

        notified70: false,
      },
    ],

    flags: {
      notifiedNoStatements: false,
      notifiedNoTransactions: false,
    },

    prediction: {
      nextMonthExpense: 58000,
      confidence: "high",
      reason:
        "Recurring rent, SIPs, dining, and lifestyle spending remain stable.",
    },

    breakdown: {
      essential: 33000,
      lifestyle: 18000,
      impulsive: 6000,
      updatedAt: new Date(),
    },

    lifeMetrics: {
      financialStabilityScore: 82,
      survivalMonths: 7.4,
      stressRisk: "low",
      savingsRate: 33,
      emergencyFundStatus: "good",
      updatedAt: new Date(),
    },

    gamification: {
      level: 5,

      xp: 820,

      streaks: {
        underBudgetDays: 26,
      },

      achievements: [
        {
          title: "🚀 Investment Starter",
          unlockedAt: new Date(),
        },

        {
          title: "💰 Consistent Saver",
          unlockedAt: new Date(),
        },
      ],

      lastUpdated: new Date(),
    },

    latest_no_of_transactions: 16,
  },

  family: {
    monthlyIncome: 145000,

    transactions: [
      // -------------------------
      //  INCOME
      // -------------------------
      {
        amount: 145000,
        category: "Income",
        type: "Income",
        mode: "Bank",
        date: new Date("2026-05-01"),
      },

      // =========================
      //  ESSENTIAL EXPENSES
      // Target Total = 70000
      // =========================

      // house rent / EMI
      {
        amount: 35000,
        category: "Essential",
        type: "Expense",
        mode: "Bank",
        date: new Date("2026-05-02"),
      },

      // school fees
      {
        amount: 18000,
        category: "Essential",
        type: "Expense",
        mode: "Bank",
        date: new Date("2026-05-05"),
      },

      // groceries
      {
        amount: 5000,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-04"),
      },

      // utilities
      {
        amount: 2500,
        category: "Essential",
        type: "Expense",
        mode: "Cash",
        date: new Date("2026-05-11"),
      },

      // insurance premium
      {
        amount: 4500,
        category: "Essential",
        type: "Expense",
        mode: "Bank",
        date: new Date("2026-05-12"),
      },

      // fuel + transport
      {
        amount: 2500,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-13"),
      },

      // internet + electricity
      {
        amount: 2500,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-14"),
      },

      // =========================
      //  LIFESTYLE EXPENSES
      // Target Total = 22000
      // =========================

      // dining
      {
        amount: 6000,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-06"),
      },

      // subscriptions
      {
        amount: 2500,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-09"),
      },

      // family outing
      {
        amount: 4500,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-15"),
      },

      // shopping
      {
        amount: 5000,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-17"),
      },

      // entertainment
      {
        amount: 4000,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-18"),
      },

      // =========================
      //  IMPULSIVE EXPENSES
      // Target Total = 9000
      // =========================

      // online shopping
      {
        amount: 4000,
        category: "Impulsive",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-08"),
      },

      // gadget purchase
      {
        amount: 3000,
        category: "Impulsive",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-19"),
      },

      // unplanned spending
      {
        amount: 2000,
        category: "Impulsive",
        type: "Expense",
        mode: "Cash",
        date: new Date("2026-05-20"),
      },
    ],

    statements: [],

    aiHistory: [
      {
        score: 71,

        personality: "Responsible Planner",

        insights: [
          {
            text: "Education and household costs form the largest expense category.",
            type: "habit",
          },

          {
            text: "Family maintains healthy recurring savings contributions.",
            type: "opportunity",
          },

          {
            text: "Medical emergencies could heavily impact finances without larger reserves.",
            type: "risk",
          },
        ],

        fixes: [
          {
            action:
              "Increase emergency fund to cover at least 6 months of expenses.",
            priority: "high",
          },

          {
            action: "Review recurring subscriptions and utility bills.",
            priority: "medium",
          },
        ],

        impact: {
          savingsPotential: 15000,
          projectedSavings: 180000,
          riskLevel: "medium",
        },

        snapshot: {
          income: 145000,
          totalSpent: 101000,
          savingsRate: 30,
        },

        createdAt: new Date(),
      },
    ],

    goals: [
      {
        title: "Child Education Fund",
        targetAmount: 1500000,

        deadline: new Date("2030-01-01"),

        priority: "high",

        progress: {
          savedAmount: 320000,
          percentage: 21,
        },

        status: "active",

        notified70: false,
      },

      {
        title: "New Car",
        targetAmount: 900000,

        deadline: new Date("2027-09-01"),

        priority: "medium",

        progress: {
          savedAmount: 180000,
          percentage: 20,
        },

        status: "active",

        notified70: false,
      },
    ],

    flags: {
      notifiedNoStatements: false,
      notifiedNoTransactions: false,
    },

    prediction: {
      nextMonthExpense: 104000,
      confidence: "medium",
      reason:
        "Education, utilities, and household costs are expected to remain stable.",
    },

    breakdown: {
      essential: 70000,
      lifestyle: 22000,
      impulsive: 9000,
      updatedAt: new Date(),
    },

    lifeMetrics: {
      financialStabilityScore: 76,
      survivalMonths: 5.8,
      stressRisk: "medium",
      savingsRate: 30,
      emergencyFundStatus: "good",
      updatedAt: new Date(),
    },

    gamification: {
      level: 6,

      xp: 1250,

      streaks: {
        underBudgetDays: 18,
      },

      achievements: [
        {
          title: "🏠 Family Planner",
          unlockedAt: new Date(),
        },
      ],

      lastUpdated: new Date(),
    },

    latest_no_of_transactions: 16,
  },

  freelancer: {
    monthlyIncome: 65000,

    transactions: [
      // =========================
      //  FREELANCER
      // =========================

      // -------------------------
      //  INCOME
      // irregular client payments
      // -------------------------
      {
        amount: 45000,
        category: "Income",
        type: "Income",
        mode: "Bank",
        date: new Date("2026-05-01"),
      },

      {
        amount: 15000,
        category: "Income",
        type: "Income",
        mode: "UPI",
        date: new Date("2026-05-06"),
      },

      // -------------------------
      //  ESSENTIAL EXPENSES
      // Total ≈ 18000
      // rent, internet, software, utilities
      // -------------------------
      {
        amount: 9000,
        category: "Essential",
        type: "Expense",
        mode: "Bank",
        date: new Date("2026-05-02"),
      },

      // internet + coworking
      {
        amount: 4500,
        category: "Essential",
        type: "Expense",
        mode: "Cash",
        date: new Date("2026-05-07"),
      },

      // utilities + subscriptions
      {
        amount: 4500,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-10"),
      },

      // -------------------------
      //  LIFESTYLE EXPENSES
      // Total ≈ 12000
      // cafes, dining, streaming, outings
      // -------------------------
      {
        amount: 5000,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-04"),
      },

      {
        amount: 2800,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-09"),
      },

      {
        amount: 4200,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-12"),
      },

      // -------------------------
      //  IMPULSIVE EXPENSES
      // Total ≈ 7000
      // gadgets / creative tools
      // -------------------------
      {
        amount: 3500,
        category: "Impulsive",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-05"),
      },

      // plugin / gadget purchase
      {
        amount: 3500,
        category: "Impulsive",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-14"),
      },
      // -------------------------
      // Additional Freelancer Transactions
      // Keeps totals aligned with:
      // essential: 18000
      // lifestyle: 12000
      // impulsive: 7000
      // totalSpent: 47000
      // -------------------------

      // extra income (reflecting irregular freelance cash flow)
      {
        amount: 5000,
        category: "Income",
        type: "Income",
        mode: "UPI",
        date: new Date("2026-05-18"),
      },

      // -------------------------
      //  ESSENTIAL
      // -------------------------

      // cloud storage subscription
      {
        amount: 1200,
        category: "Essential",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-13"),
      },

      // mobile bill
      {
        amount: 800,
        category: "Essential",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-15"),
      },

      // workspace utilities
      {
        amount: 1000,
        category: "Essential",
        type: "Expense",
        mode: "Cash",
        date: new Date("2026-05-16"),
      },

      // -------------------------
      //  LIFESTYLE
      // -------------------------

      // coffee shop work session
      {
        amount: 1500,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-17"),
      },

      // weekend outing
      {
        amount: 1200,
        category: "Lifestyle",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-19"),
      },

      // streaming + entertainment
      {
        amount: 1000,
        category: "Lifestyle",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-20"),
      },

      // -------------------------
      //  IMPULSIVE
      // -------------------------

      // design asset purchase
      {
        amount: 1200,
        category: "Impulsive",
        type: "Expense",
        mode: "UPI",
        date: new Date("2026-05-21"),
      },

      // keyboard accessory
      {
        amount: 800,
        category: "Impulsive",
        type: "Expense",
        mode: "Card",
        date: new Date("2026-05-22"),
      },
    ],

    statements: [],

    aiHistory: [
      {
        score: 58,

        personality: "Independent Hustler",

        insights: [
          {
            text: "Income fluctuations create unstable monthly cash flow.",
            type: "risk",
          },

          {
            text: "Client growth creates strong future earning potential.",
            type: "opportunity",
          },

          {
            text: "Frequent gadget and software purchases increase business costs.",
            type: "habit",
          },
        ],

        fixes: [
          {
            action:
              "Maintain a 6-month emergency buffer for low-income months.",
            priority: "high",
          },

          {
            action: "Separate business and personal expenses.",
            priority: "high",
          },

          {
            action:
              "Allocate fixed percentages of income toward taxes and savings.",
            priority: "medium",
          },
        ],

        impact: {
          savingsPotential: 8000,
          projectedSavings: 90000,
          riskLevel: "high",
        },

        snapshot: {
          income: 65000,
          totalSpent: 45500,
          savingsRate: 30,
        },

        createdAt: new Date(),
      },
    ],

    goals: [
      {
        title: "Studio Setup",
        targetAmount: 150000,

        deadline: new Date("2027-02-01"),

        priority: "high",

        progress: {
          savedAmount: 35000,
          percentage: 23,
        },

        status: "active",

        notified70: false,
      },
    ],

    flags: {
      notifiedNoStatements: false,
      notifiedNoTransactions: false,
    },

    prediction: {
      nextMonthExpense: 48000,
      confidence: "low",
      reason:
        "Freelance income and creative business expenses fluctuate monthly.",
    },

    breakdown: {
      essential: 21000,
      lifestyle: 15500,
      impulsive: 9000,
      updatedAt: new Date(),
    },

    lifeMetrics: {
      financialStabilityScore: 61,
      survivalMonths: 2.9,
      stressRisk: "medium",
      savingsRate: 30,
      emergencyFundStatus: "average",
      updatedAt: new Date(),
    },

    gamification: {
      level: 3,

      xp: 380,

      streaks: {
        underBudgetDays: 7,
      },

      achievements: [
        {
          title: "🎨 Side Hustle Starter",
          unlockedAt: new Date(),
        },
      ],

      lastUpdated: new Date(),
    },

    latest_no_of_transactions: 19,
  },
};
