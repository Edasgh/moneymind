"use server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
