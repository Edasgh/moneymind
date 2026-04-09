"use server";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import { getServerSession } from "next-auth";

// add a financial goal
export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession();
  const userId = session?.user?.id;

  const { title, targetAmount, deadline, priority } = await req.json();

  const finance = await Finance.findOne({ userId });

  if (!finance) {
    return Response.json({ error: "No finance profile" });
  }

  finance.goals.push({
    title,
    targetAmount,
    deadline,
    priority,
  });

  await finance.save();

  return Response.json({ success: true });
}
