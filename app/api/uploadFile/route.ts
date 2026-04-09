"use server";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import Statement from "@/models/Statement";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Finance from "@/models/Finance";
import { createNotification } from "@/lib/createNotification";

//for uploading to convex cloud
const convexClient = getConvexClient();

export const POST = async (request: Request) => {
  await connectDB();
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as String | null;

    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Unauthorized!");
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    if (!file || !fileName) {
      console.log("File and fileName are required");
      return NextResponse.json(
        { error: "File and fileName are required" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log("Max 5MB allowed");
      return NextResponse.json({ error: "Max 5MB allowed" }, { status: 400 });
    }

    if (!["application/pdf", "text/csv"].includes(file.type)) {
      console.log("Only PDF or CSV allowed");
      return NextResponse.json(
        { error: "Only PDF or CSV allowed" },
        { status: 400 },
      );
    }

    //upload in convex cloud
    //generate a short lived upload url
    const postUrl = await convexClient.mutation(
      api.fileControls.generateuploadUrl,
    );
    // POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      console.log("Failed to upload file to Convex");
      return NextResponse.json(
        { error: "Failed to upload file to Convex" },
        { status: 500 },
      );
    }

    const { storageId } = await result.json();

    const fileUrl = await convexClient.query(api.fileControls.getFileUrl, {
      storageId,
    });

    const statement = await Statement.create({
      userId: session.user.id, // get from session
      fileName: fileName,
      storageId,
      fileUrl,
      type: file.type.includes("pdf") ? "pdf" : "csv",
      status: "uploaded",
      processing: {
        attempts: 0,
      },
    });

    const findFinanceSchema = await Finance.findOne({
      userId: session.user.id,
    });
    if (findFinanceSchema) {
      await Finance.findByIdAndUpdate(findFinanceSchema._id, {
        $push: { statements: statement._id },
      });
    } else {
      await Finance.create({
        userId: session.user.id,
        statements: [statement._id],
      });
    }

    await createNotification({
      userId:session.user.id,
      type: "STATEMENT_UPLOADED",
      title: "Statement Uploaded 📄",
      message: "Your bank statement has been uploaded successfully",
    });

    // Return a successful response
    return NextResponse.json(
      {
        message: `${fileName} uploaded. Processing started.`,
        fileUrl,
        storageId,
        statementId: statement._id,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log("Error from uploadFile route : ", err);
    // Return an error response
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
};
