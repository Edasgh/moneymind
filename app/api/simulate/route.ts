"use server";
import Finance from "@/models/Finance";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { simulateSavingsImpact } from "@/lib/simulateSavings";
import { connectDB } from "@/lib/db";
import { currencyMap } from "@/lib/currencyMap";

export async function POST(req: Request) {
  const { reduction } = await req.json();

  if (!reduction || reduction < 0) {
    return Response.json({ error: "Invalid reduction" }, { status: 400 });
  }

  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ reply: "Unauthorized" }, { status: 401 });
  }

  const currency_str =
    currencyMap[session.user.country?.toString() as keyof typeof currencyMap] ||
    "₹";

  const finance = await Finance.findOne({ userId: session.user.id });

  const transactions = finance.transactions;
  const latestSnapshot = finance.aiHistory?.at(-1)?.snapshot;

  if (!latestSnapshot) {
    return Response.json(
      { error: "No financial analysis available" },
      { status: 400 },
    );
  }

  const result = simulateSavingsImpact(
    transactions,
    latestSnapshot,
    reduction,
    session.user.country?.toString(),
  );

  return Response.json({
    ...result,
    message: `Reducing ${currency_str}${reduction} improves your savings by ${result.savingsGain}`,
  });
}
