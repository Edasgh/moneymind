"use server";
// /api/notifications/read

import { NextResponse } from "next/server";
import Notification from "@/models/Notification";

export async function POST(req: any) {
  const { ids } = await req.json();

  await Notification.updateMany(
    { _id: { $in: ids } },
    { $set: { read: true } }
  );

  return NextResponse.json({ success: true });
}