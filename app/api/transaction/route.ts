"use server"
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; 
import {connectDB} from "@/lib/db";
import Finance from "@/models/Finance";

export const POST = async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, category, type, mode, date } = await request.json();

    await connectDB();

    const finance = await Finance.findOne({ userId: session.user.id });

    if (!finance) {
      return NextResponse.json(
        { error: "Finance doc not found" },
        { status: 404 },
      );
    }

    const newTransaction = {
      amount: Number(amount),
      category,
      type,
      mode,
      date: new Date(date),
    };

    finance.transactions.push(newTransaction);

    // ❗ reset AI flags (important)
    finance.flags.notifiedNoTransactions = false;

    await finance.save();

    return NextResponse.json(
      {
        message: "Transaction added",
        transactions: finance.transactions,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add transaction" },
      { status: 500 },
    );
  }
};
