import { NextResponse } from "next/server";
import User from "@/models/User";
import Finance from "@/models/Finance";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, country } = await req.json();

    // 🔒 Validation
    if (!name || !email || !password || !country) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // 👤 Create User
    const user = await User.create({
      name,
      email,
      password,
      country,
    });

    // 💰 Create Finance doc (MINIMAL)
    await Finance.create({
      userId: user._id,
      monthlyIncome: 0,
      transactions: [],
      statements: [],
      aiHistory: [],
      goals: [],
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
