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
    userId: z.string().min(1, { message: "User ID is required" }),
  });
  
  export const deleteUserFromBase = async (
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
        "user-base-delete"
      );
      if (!success) {
        return toActionState("ERROR", "Too many requests", formData);
      }
  
      const isAdmin = await isOrgAdminOrOwner(user.userId);
      if (!isAdmin) {
        return toActionState("ERROR", "Forbidden", formData);
      }
  
      const org = await getUserOrg(user.userId);
      if (!org.org) {
        return toActionState("ERROR", "No organization found", formData);
      }
  
      const { userId } = inputSchema.parse({
        userId: String(formData.get("userId") ?? ""),
      });
  
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userToDelete) {
        return toActionState("ERROR", "User not found", formData);
      }
  
      const deleted = await prisma.user.delete({
        where: { id: userId },
      });
  
      await createAuditLog({
        orgId: org.org?.id ?? "",
        actorId: user.userId,
        action: "USER_DELETED",
        entityType: "USER",
        entityId: userId,
      });
  
      return toActionState("SUCCESS", "User deleted", formData, {
        user: deleted,
      });
    } catch (error) {
      return fromErrorToActionState(error);
    }
  };
  