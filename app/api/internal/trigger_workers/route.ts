"use server";
// /api/internal/trigger_workers
const BASE_URL=process.env.BASE_URL;
const SECRET=process.env.WORKER_SECRET;
export async function GET() {
  await fetch(`${BASE_URL}/api/worker/process-statements?secret=${SECRET}`);
  await fetch(`${BASE_URL}/api/worker/analyze-finances?secret=${SECRET}`);
  return Response.json({ ok: true });
}
