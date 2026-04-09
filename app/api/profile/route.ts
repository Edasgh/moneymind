"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Statement from "@/models/Statement";
import Finance from "@/models/Finance";
import { connectDB } from "@/lib/db";

export const GET = async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Unauthorized!");
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    await connectDB();

    //get all statements
    const statements = await Statement.find({ userId: session.user.id });
    // monthly income, total spent, total saved
    const financeDoc = await Finance.findOne({ userId: session.user.id });

    return NextResponse.json(
      { message: "User data got successfully!", statements, financeDoc },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Can't get user's financial details!" },
      { status: 500 },
    );
  }
};

export const PATCH = async (request: Request) => {
  const { financeId, monthlyIncome } = await request.json();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Unauthorized!");
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    await connectDB();

    const updatedFinanceDoc = await Finance.findByIdAndUpdate(
      financeId,
      { monthlyIncome : Number(monthlyIncome) },
      { returnDocument: "after" },
    );
    return NextResponse.json(
      {
        message: "Finance doc got updated successfully!",
        financeDoc: updatedFinanceDoc,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Can't update user's financial details!" },
      { status: 500 },
    );
  }
};
