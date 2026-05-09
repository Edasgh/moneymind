"use server";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL;
const SECRET = process.env.WORKER_SECRET;

// add a financial goal
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const userId = session.user.id;

    const { title, targetAmount, deadline, priority } = await req.json();

    const finance = await Finance.findOne({ userId });

    if (!finance) {
      return NextResponse.json({ error: "No finance profile" },{status:404});
    }

    finance.goals.push({
      title,
      targetAmount,
      deadline,
      priority,
    });

    await finance.save();

    // trigger analysis of finance
    // await fetch(`${BASE_URL}/api/worker/analyze-finances?secret=${SECRET}`);

    return NextResponse.json({ success: true, goals:finance.goals },{status:201});
  } catch (error) {
    console.log("Error while adding goal :", error);
    return NextResponse.json({ error: "Failed to add goal" }, { status: 500 });
  }
}

// update a financial goal
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const userId = session.user.id;

    const { title, targetAmount, deadline, priority, goalId } =
      await req.json();

    const finance = await Finance.findOne({ userId });

    if (!finance) {
      return NextResponse.json(
        { error: "No finance profile" },
        { status: 404 },
      );
    }

    // =========================
    // 🔍 FIND GOAL AND UPDATE
    // =========================
    await Finance.updateOne(
      { userId, "goals._id": goalId },
      {
        $set: {
          "goals.$.title": title,
          "goals.$.targetAmount": targetAmount,
          "goals.$.deadline": deadline,
          "goals.$.priority": priority,
        },
      },
    );

    // trigger analysis of finance
    // await fetch(`${BASE_URL}/api/worker/analyze-finances?secret=${SECRET}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error while updating goal:", error);

    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// delete a goal
export async function DELETE(req: Request) {
   const session = await getServerSession(authOptions);

   if (!session?.user?.id) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   try {
    await connectDB();

    const userId = session.user.id;

    const { goalId } = await req.json();

    const finance = await Finance.findOne({ userId });

    if (!finance) {
      return NextResponse.json({ error: "No finance profile" },{status:404});
    }

    finance.goals = finance.goals.filter((g: any) => g._id.toString() !== goalId);

    await finance.save();

    // trigger analysis of finance
    // await fetch(`${BASE_URL}/api/worker/analyze-finances?secret=${SECRET}`);

    return NextResponse.json({ success: true },{status:200});
   } catch (error) {
    console.log("Error while deleting goal :", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
   }
  
}
