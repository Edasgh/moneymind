"use server";
import Finance from "@/models/Finance";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { simulateSavingsImpact } from "@/lib/simulateSavings";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  const { reduction } = await req.json();

  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ reply: "Unauthorized" }, { status: 401 });
  }

  const finance = await Finance.findOne({ userId:session.user.id });

  const transactions = finance.transactions;

  const result = simulateSavingsImpact(transactions, reduction);

  return Response.json(result);
}
