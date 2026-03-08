import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isOrgAdminOrOwner } from "@/lib/auth";
import { MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import { supabaseAdmin } from "@/lib/supabase/admin";

// export const runtime = "nodejs";

const BUCKET =
  process.env.SUPABASE_PROCEDURE_IMPORTS_BUCKET ?? "procedure-imports";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    // Auth
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isOrgAdminOrOwner(userId!);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only organization admins can upload imports" },
        { status: 403 },
      );
    }

    // User Org
    const membership = await prisma.orgMembership.findFirst({
      where: { userId },
      select: { orgId: true },
    });

    if (!membership?.orgId) {
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
    const objectPath = `orgs/${membership.orgId}/imports/${crypto.randomUUID()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload failed:", uploadError);
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
