import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "STATEMENT_UPLOADED",
        "STATEMENT_PROCESSED",
        "ANALYSIS_READY",
        "GOAL_UPDATE",
        
        // NEWLY ADDED
        "TRANSACTION_ADDED",
        "LEVEL_UP",
        "ACHIEVEMENT_UNLOCKED",
        "STREAK_UPDATE",
        "ANALYSIS_SKIPPED",
      ],
      required: true,
    },

    title: String,
    message: String,

    metadata: {
      statementId: mongoose.Schema.Types.ObjectId,
      financeId: mongoose.Schema.Types.ObjectId,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// ⚡ latest first
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
