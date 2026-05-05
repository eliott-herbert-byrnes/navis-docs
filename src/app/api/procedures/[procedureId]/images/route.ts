import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// export const runtime = "nodejs";

const BUCKET =
  process.env.SUPABASE_PROCEDURE_IMAGES_BUCKET ?? "procedure-images";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ procedureId: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { procedureId } = await params;

    // Find user's org
    const membership = await prisma.orgMembership.findFirst({
      where: { userId },
      select: { orgId: true, role: true },
    });

    if (!membership?.orgId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 },
      );
    }
    if (!["ADMIN", "OWNER"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Only organization admins can upload images" },
        { status: 403 },
      );
    }

    // Verify procedure belongs to same org
    const procedure = await prisma.procedure.findFirst({
      where: {
        id: procedureId,
        team: {
          department: {
            orgId: membership.orgId,
          },
        },
      },
      select: { id: true },
    });

    if (!procedure) {
      return NextResponse.json(
        { error: "Procedure not found" },
        { status: 404 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
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

    const safeName = sanitizeFileName(file.name || "image");
    const objectPath = `orgs/${membership.orgId}/procedures/${procedureId}/${crypto.randomUUID()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      await storage.upload(BUCKET, objectPath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    } catch (uploadErr) {
      console.error("Storage upload failed:", uploadErr);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const src = `/api/procedure-images?path=${encodeURIComponent(objectPath)}`;

    return NextResponse.json(
      {
        path: objectPath,
        src,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Image upload route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
