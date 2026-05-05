import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import { storage } from "@/lib/storage";

const BUCKET =
  process.env.SUPABASE_PROCEDURE_IMPORTS_BUCKET ?? "procedure-imports";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ctx.isAdmin) {
      return NextResponse.json(
        { error: "Only organization admins can upload imports" },
        { status: 403 },
      );
    }

    if (!ctx.org?.id) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 },
      );
    }

    // Read file from form-data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate type & size
    const allowedTypes = [
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Only .txt and .docx files are allowed.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Max is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 },
      );
    }

    // Build storage path: orgs/{orgId}/imports/{uuid}-{safeName}
    const safeName = sanitizeFileName(file.name || "procedure");
    const objectPath = `orgs/${ctx.org.id}/imports/${crypto.randomUUID()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to storage
    try {
      await storage.upload(BUCKET, objectPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    } catch (uploadErr) {
      console.error("Storage upload failed:", uploadErr);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    //  Return fileKey for ingestion pipeline
    return NextResponse.json(
      {
        fileKey: objectPath,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Procedure import upload route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
