"use server";

import { NextRequest, NextResponse } from "next/server";
import Statement from "@/models/Statement";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Finance from "@/models/Finance";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { triggerWorker } from "@/lib/triggerWorker";

//for uploading to convex cloud
const convexClient = getConvexClient();


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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const finance = await Finance.findOne({ userId: session.user.id });
    if (!finance) {
      return NextResponse.json({ error: "Finance not found" }, { status: 404 });
    }
    const { id } = await context.params;
    finance.statements = finance.statements.filter(
      (f: any) => f.toString() !== id.toString(),
    );
    await finance.save();
    const stmt = await Statement.findByIdAndDelete(id);
    if (!stmt) {
      return NextResponse.json(
        { error: "Statement not found" },
        { status: 404 },
      );
    }

    await convexClient.mutation(api.fileControls.deleteFileById, {
      storageId: stmt.storageId,
    });

    // trigger analysis of finance
    await triggerWorker({ runProcess: false, runAnalysis: true });

    return NextResponse.json(
      { message: "Statement deleted successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in statement deletion : ", error);
    return NextResponse.json(
      { message: "Failed to delete statement!" },
      { status: 500 },
    );
  }
}
