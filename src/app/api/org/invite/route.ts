import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { limiter } from "@/lib/ratelimit";
import { Resend } from "resend";
import { randomBytes, createHash } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY!);

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const { success } = await limiter.limit(`invite:${ip}`);
  if (!success)
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrg(user.userId);
  if (!org) return NextResponse.json({ error: "No org" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const rawEmail = body?.email as string | undefined;
  const rawRole = body?.role as string | undefined;
  const email = rawEmail?.toLowerCase().trim();
  const role = rawRole?.toLowerCase().trim();

  if (!email || !role)
    return NextResponse.json({ error: "email/role required" }, { status: 400 });
  if (!["member", "admin"].includes(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }

  const mem = await prisma.orgMembership.findFirst({
    where: { orgId: org.id, userId: user.userId },
  });
  if (!mem || !["owner", "admin"].includes(mem.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingPending = await prisma.invitation.findFirst({
    where: {
      orgId: org.id,
      email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });
  if (existingPending) {
    return NextResponse.json(
      { error: "Invite already pending for this email" },
      { status: 409 }
    );
  }

  const rawToken = randomBytes(24).toString("base64url");
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      orgId: org.id,
      email,
      role,
      tokenHash,
      expiresAt,
      invitedByUserId: user.userId,
      status: "PENDING",
    },
  });

  const link = `${process.env.NEXTAUTH_URL}/accept-invite?token=${rawToken}`;

  console.log(link);

  // TODO: purchase domain and add emails
  //   await resend.emails.send({
  //     from: "Navis Docs <no-reply@app.navisdocs.com>",
  //     to: email,
  //     subject: `You are invited to ${org.name}`,
  //     text: `Join ${org.name}: ${link}\nThis invite expires on ${expiresAt.toDateString()}.`,
  //   });

  return NextResponse.json({ ok: true });
}
