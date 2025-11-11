"use server";

import { homePath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
  orgId: z.string().min(1, { message: "Organization ID is required" }),
  orgName: z
    .string()
    .min(1, { message: "Organization name is required" })
    .max(100, { message: "Organization name must be less than 100 characters" }),
});

export const updateOrganization = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const { org, isAdmin } = await getUserOrgWithRole(user.userId);
    if (!org || !isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const parsed = inputSchema.parse({
      orgId: String(formData.get("orgId") ?? ""),
      orgName: String(formData.get("orgName") ?? "").trim(),
    });

    const { orgId, orgName } = parsed;

    if (orgId !== org.id) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const beforeState = {
      id: org.id,
      name: org.name,
    };

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: { name: orgName },
    });

    await createAuditLog({
      orgId: org.id,
      actorId: user.userId,
      action: "ORGANIZATION_UPDATED",
      entityType: "ORGANIZATION",
      entityId: org.id,
      beforeJSON: beforeState,
      afterJSON: {
        id: updatedOrg.id,
        name: updatedOrg.name,
      },
    });

    revalidatePath(homePath());

    return toActionState(
      "SUCCESS",
      "Organization updated successfully",
      formData,
      { org: updatedOrg }
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};