import { NextResponse } from "next/server";
import Statement from "@/models/Statement";
import { connectDB } from "@/lib/db";
import { parseStatementWithAI } from "@/lib/ai/parseStatement";
import { generateSummary, normalizeTransactions } from "@/lib/statementParser";
import { createNotification } from "@/lib/createNotification";

// =========================
// ⚙️ CONFIG
// =========================
const MAX_RETRIES = 5;
const BATCH_SIZE = 3;
const STALE_TIME = 2 * 60 * 1000; // 2 min

// =========================
// 🧠 HELPERS
// =========================
function getRetryDelay(attempts: number) {
  return Math.min(2 ** attempts * 1000, 60 * 1000);
}

// =========================
// 🧠 CORE PROCESSOR
// =========================
async function processStatement(stmt: any) {
  const { transactions, rawText } = await parseStatementWithAI(stmt);

  const normalized = normalizeTransactions(transactions);
  const summary = generateSummary(normalized);

  return {
    transactions: normalized,
    summary,
    rawText,
  };
}

// =========================
// 🚀 WORKER ROUTE
// =========================
export async function GET(req: Request) {
  console.log("🚀 Worker started at:", new Date().toISOString());
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.WORKER_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const staleTime = new Date(Date.now() - STALE_TIME);

  let processed = 0;
  let success = 0;
  let failed = 0;

  // =========================
  // 🔁 PROCESS LOOP (SAFE)
  // =========================
  for (let i = 0; i < BATCH_SIZE; i++) {
    // ATOMIC FETCH + LOCK
    const stmt = await Statement.findOneAndUpdate(
      {
        $and: [
          {
            $or: [
              { status: "uploaded" },
              {
                status: "failed",
                "processing.nextRetryAt": { $lte: now },
              },
              {
                status: "processing",
                "processing.lastTriedAt": { $lte: staleTime }, // recover stuck jobs
              },
            ],
          },
          {
            $or: [
              { "processing.attempts": { $lt: MAX_RETRIES } },
              { "processing.attempts": { $exists: false } },
            ],
          },
        ],
      },
      {
        $set: {
          status: "processing",
          "processing.lastTriedAt": now,
        },
        $inc: {
          "processing.attempts": 1,
        },
      },
      { new: true },
    );

    if (!stmt) break; // no jobs left

    try {
      // =========================
      // 🔥 PROCESS
      // =========================
      const result = await processStatement(stmt);

      stmt.extractedTransactions = result.transactions;
      stmt.summary = result.summary;

      stmt.parsingMeta = {
        rawText: result.rawText,
        errors: [],
      };

      stmt.status = "parsed";
      stmt.processing.nextRetryAt = null;

      await stmt.save();

      // 🔔 NOTIFICATION: Statement Processed
      await createNotification({
        userId: stmt.userId,
        type: "STATEMENT_PROCESSED",
        title: "Statement Processed ⚙️",
        message: "Your bank statement has been successfully processed",
        metadata: {
          statementId: stmt._id,
        },
      });

      success++;
    } catch (err: any) {
      console.error("Processing failed:", err.message);

      const attempts = stmt.processing?.attempts || 1;

      if (attempts >= MAX_RETRIES) {
        stmt.status = "failed"; // permanent
      } else {
        const delay = getRetryDelay(attempts);

        stmt.status = "failed";
        stmt.processing.nextRetryAt = new Date(Date.now() + delay);
      }

      stmt.parsingMeta = {
        rawText: stmt.parsingMeta?.rawText || "",
        errors: [...(stmt.parsingMeta?.errors || []), err.message],
      };

      await stmt.save();

      failed++;
    }

    processed++;
  }

  return NextResponse.json({
    processed,
    success,
    failed,
  },{status:200});
}
