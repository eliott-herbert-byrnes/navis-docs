import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { z } from "zod";

const inputSchema = z.object({
  processId: z.string().min(1, { message: "Process ID is required" }),
});

export const deleteProcessFromBase = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const { success } = await getLimitByUser(
      deleteLimiter,
      user.userId,
      "process-base-delete"
    );
    if (!success) {
      return toActionState("ERROR", "Too many requests", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const org = await getUserOrg(user.userId);
    if (!org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const { processId } = inputSchema.parse({
      processId: String(formData.get("processId") ?? ""),
    });

    const process = await prisma.process.findUnique({
      where: { id: processId },
    });
    if (!process) {
      return toActionState("ERROR", "Process not found", formData);
    }

    const deleted = await prisma.process.delete({
      where: { id: processId },
    });

    await createAuditLog({
      orgId: org.id,
      actorId: user.userId,
      action: "PROCESS_DELETED",
      entityType: "PROCESS",
      entityId: processId,
    });

    return toActionState("SUCCESS", "Process deleted", formData, {
      process: deleted,
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
