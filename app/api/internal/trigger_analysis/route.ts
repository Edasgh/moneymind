"use server";
import { triggerWorker } from "@/lib/triggerWorker";
// trigger only analysis
// /api/internal/trigger_analysis
export async function GET() {
  await triggerWorker({ runProcess: false, runAnalysis: true });
  return Response.json({ ok: true });
}
