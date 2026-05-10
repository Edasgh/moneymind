import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { fullDemoData } from "@/lib/demoData/fullDemoData";
import Finance from "@/models/Finance";

export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { option } = await req.json(); // student, professional, family, freelancer

  try {
    await Finance.findOneAndUpdate(
      { userId: session.user.id },
      {
        ...fullDemoData[option as keyof typeof fullDemoData],
        isDemo: true,
      },
      { upsert: true },
    );

    return NextResponse.json(
      { message: "Demo data loaded successfully!", success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error loading demo data : ", error);
    return NextResponse.json(
      { message: "Failed to load demo data" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Finance.findOneAndDelete({ userId: session.user.id, isDemo: true });
  return NextResponse.json(
    { message: "Demo data deleted successfully!", success: true },
    { status: 200 },
  );
}
