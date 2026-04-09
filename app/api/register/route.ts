import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, country } = await req.json();

    // 🔒 Basic validation
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

    // ✅ DO NOT HASH HERE
    const user = await User.create({
      name,
      email,
      password, // 🔥 raw password → schema will hash it
      country,
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
