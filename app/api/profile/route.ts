"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Statement from "@/models/Statement";
import Finance from "@/models/Finance";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

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

// edit user
export const PUT = async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    await connectDB();

    const { name, country, monthlyIncome } = await request.json();

    const userId = session.user.id;

    // =========================
    // 🧑 UPDATE USER
    // =========================
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(country && { country }),
      },
      { new: true },
    );

    // =========================
    // 💰 UPDATE FINANCE
    // =========================
    let updatedFinance = null;

    if (monthlyIncome !== undefined) {
      updatedFinance = await Finance.findOneAndUpdate(
        { userId },
        { monthlyIncome: Number(monthlyIncome) },
        { new: true },
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully!",
        user: updatedUser,
        finance: updatedFinance,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update error:", error);

    return NextResponse.json(
      { error: "Can't update user details!" },
      { status: 500 },
    );
  }
};

/**
import { signIn } from "next-auth/react";

// after PUT success
await signIn("credentials", {
  redirect: false,
});

toast.success("Profile updated 🚀");
 
 */