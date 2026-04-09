"use server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(req: any) {
  await connectDB();

  const userId = req.headers.get("user-id"); // or auth

  const notifications = await Notification.find({
    userId,
    read: false,
  })
    .sort({ createdAt: 1 }) // oldest first (important for queue)
    .limit(10);

  return NextResponse.json({ notifications });
}
