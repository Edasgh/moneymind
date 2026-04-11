"use server";

import { NextRequest, NextResponse } from "next/server";
import Statement from "@/models/Statement";
import { connectDB } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await context.params;

  const stmt = await Statement.findById(id);

  if (!stmt) {
    return NextResponse.json(
      { message: "Statement not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(stmt);
}
