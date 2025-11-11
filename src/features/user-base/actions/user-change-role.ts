"use server";

import { userBasePath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrgMembershipRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  role: z.string().min(1, { message: "Role is required" }),
});

export const changeUserRole = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized");
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Forbidden");
    }

    const org = await getUserOrg(user.userId);
    if (!org.org) {
      return toActionState("ERROR", "No organization found");
    }

    const { userId, role } = inputSchema.parse({
      userId: String(formData.get("userId") ?? ""),
      role: String(formData.get("role") ?? ""),
    });

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToUpdate) {
      return toActionState("ERROR", "User not found");
    }

    const roleMap: Record<string, OrgMembershipRole> = {
      admin: "ADMIN",
      member: "MEMBER",
    };
    const newRole: OrgMembershipRole =
      roleMap[(role || "").toLowerCase()] ?? "MEMBER";

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        memberships: {
          update: {
            where: {
              orgId_userId: { orgId: org.org?.id ?? "", userId: userId },
            },
            data: { role: newRole as OrgMembershipRole },
          },
        },
      },
    });

    await createAuditLog({
      orgId: org.org?.id ?? "",
      actorId: user.userId,
      action: "USER_ROLE_CHANGED",
      entityType: "USER_ROLE",
      entityId: userId,
      beforeJSON: org.role as OrgMembershipRole,
      afterJSON: newRole as OrgMembershipRole,
    });

    revalidatePath(userBasePath());

    return toActionState("SUCCESS", "User role changed", formData, {
      user: updated,
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
