import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createHash } from "crypto";
import { OrgMembershipRole } from "@prisma/client";

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

export default async function AcceptInvite({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const raw = searchParams.token?.trim();
  if (!raw) redirect("/auth/signin");
  const tokenHash = sha256(raw);

  const user = await getSessionUser();
  if (!user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/accept-invite?token=${raw}`)}`);
  }

  const invite = await prisma.invitation.findUnique({ where: { tokenHash } });

  // Validation & status checks
  if (!invite) {
    return <div className="max-w-lg mx-auto">Invite is invalid.</div>;
  }
  if (invite.status !== "PENDING") {
    return <div className="max-w-lg mx-auto">This invite has already been used or revoked.</div>;
  }
  if (invite.expiresAt < new Date()) {
    // mark expired once
    await prisma.invitation.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return <div className="max-w-lg mx-auto">Invite has expired.</div>;
  }

  // One org per user rule
  const existing = await prisma.orgMembership.findFirst({ where: { userId: user.userId } });
  if (existing) {
    return (
      <div className="max-w-lg mx-auto">
        Your account already belongs to an organization.
      </div>
    );
  }

  // Atomic accept
  await prisma.$transaction([
    prisma.orgMembership.create({
      data: { orgId: invite.orgId, userId: user.userId, role: invite.role as OrgMembershipRole },
    }),
    prisma.invitation.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
  ]);

  redirect("/app");
}