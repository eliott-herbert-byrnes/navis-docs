"use server";
import { acceptInvitePath, homePath, signInPath } from "@/app/paths";
import {
  ActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { OrgMembershipRole } from "@prisma/client";
import { redirect } from "next/navigation";

export const acceptInvite = async (
  _prev: ActionState,
  formData: FormData
): Promise<ActionState | undefined> => {
  const raw = (formData.get("token") as string | null)?.trim();
  if (!raw) redirect(signInPath());
  const tokenHash = sha256(raw);

  const user = await getSessionUser();
  if (!user) {
    redirect(
      `${signInPath()}?callbackUrl=${encodeURIComponent(acceptInvitePath(raw))}`
    );
  }

  const invite = await prisma.invitation.findUnique({ where: { tokenHash } });
  if (!invite) {
    return toActionState("ERROR", "Invite not found", formData);
  }
  if (invite.status !== "PENDING") {
    return toActionState("ERROR", "Invite already used or revoked", formData);
  }

  if (invite.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { invitationId: { orgId: invite.orgId, email: invite.email } },
      data: { status: "EXPIRED" },
    });
    return toActionState("ERROR", "Invite expired", formData);
  }

  const existing = await prisma.orgMembership.findFirst({
    where: { userId: user.userId },
  });
  if (existing) {
    return toActionState(
      "ERROR",
      "User already belongs to an organization",
      formData
    );
  }

  const roleMap: Record<string, OrgMembershipRole> = {
    owner: "OWNER",
    admin: "ADMIN",
    member: "MEMBER",
  };
  const memberRole: OrgMembershipRole =
    roleMap[(invite.role || "").toLowerCase()] ?? "MEMBER";

  await prisma.$transaction([
    prisma.orgMembership.create({
      data: {
        orgId: invite.orgId,
        userId: user.userId,
        role: memberRole,
      },
    }),
    prisma.invitation.update({
      where: { invitationId: { orgId: invite.orgId, email: invite.email } },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
  ]);

  return toActionState("SUCCESS", "Invite accepted", formData, {
    redirect: homePath(),
  });
};
