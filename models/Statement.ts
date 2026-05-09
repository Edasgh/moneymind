import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  date: Date,
  amount: Number,
  category: String,
  mode: String,
  type: String,
});

const StatementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,required:true},

    fileName: String,
    storageId: String,
    fileUrl: String,

    type: {
      type: String,
      enum: ["pdf", "csv"],
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "parsed", "failed"],
      default: "uploaded",
    },

    // Parsed Data 
    extractedTransactions: [transactionSchema],

    // Debug / AI parsing logs
    parsingMeta: {
      rawText: String,
      errors: [String],
    },
    summary: {
      totalSpent: Number,
      totalIncome: Number,
      topCategory: String,
    },
    isAICategorized: Boolean,

    processing: {
      attempts: { type: Number, default: 0 },
      lastTriedAt: Date,
      nextRetryAt: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Statement ||
  mongoose.model("Statement", StatementSchema);
