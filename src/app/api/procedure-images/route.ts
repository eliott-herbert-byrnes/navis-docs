import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";

// export const runtime = "nodejs";

const BUCKET =
  process.env.SUPABASE_PROCEDURE_IMAGES_BUCKET ?? "procedure-images";

const PATH_REGEX =
  /^orgs\/([a-z0-9-]+)\/procedures\/([a-z0-9-]+)\/([a-zA-Z0-9._-]+)$/i;

function parseManagedPath(path: string) {
  const match = path.match(PATH_REGEX);
  if (!match) return null;

  const [, orgId, procedureId] = match;
  return { orgId, procedureId };
}

export async function GET(req: Request) {
  // GET handlers can execute during `next build` when `cacheComponents` is on; skip session work until runtime.
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return new NextResponse(null, {
      status: 200,
      headers: { "Content-Length": "0" },
    });
  }

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const path = url.searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const parsed = parseManagedPath(path);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid image path format" },
        { status: 400 },
      );
    }

    // AuthZ: user must belong to the same org encoded in path
    const membership = await prisma.orgMembership.findFirst({
      where: { userId },
      select: { orgId: true },
    });

    if (!membership?.orgId || membership.orgId !== parsed.orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optional hardening: ensure procedure in path exists in same org
    const procedure = await prisma.procedure.findFirst({
      where: {
        id: parsed.procedureId,
        team: {
          department: {
            orgId: parsed.orgId,
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

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(path);

    if (error || !data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // data is Blob-like in supabase-js
    const contentType = data.type || "application/octet-stream";
    const arrayBuffer = await data.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=60",
        // Optional: inline render hint
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("Image proxy route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
