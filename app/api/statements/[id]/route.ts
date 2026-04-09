"use server";
import { NextResponse } from "next/server";
import Statement from "@/models/Statement";
import {connectDB} from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  await connectDB();

  const stmt = await Statement.findById(params.id);

  return NextResponse.json(stmt);
}
