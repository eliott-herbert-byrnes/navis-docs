"use server";
import { invitePath } from "@/app/paths";
import { toActionState } from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";

type DeleteInviteProps = {
  email: string;
  orgId: string;
};

export const deleteInvitation = async ({ email, orgId }: DeleteInviteProps) => {
  const user = await getSessionUser();
  if (!user) {
    return toActionState("ERROR", "Unauthorized");
  }

  const { success } = await getLimitByUser(
    deleteLimiter,
    user.userId,
    "invite-delete"
  );
  if (!success) {
    return toActionState("ERROR", "Too many requests");
  }

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) {
    return toActionState("ERROR", "Forbidden");
  }

  const invite = await prisma.invitation.findUnique({
    where: {
      invitationId: {
        orgId: orgId,
        email: email,
      },
    },
  });

  if (!invite) {
    return toActionState("ERROR", "Invite not found");
  }

  await prisma.invitation.delete({
    where: {
      invitationId: { orgId: orgId, email: email },
    },
  });

  revalidatePath(invitePath());

  return toActionState("SUCCESS", "Invite deleted");
};
