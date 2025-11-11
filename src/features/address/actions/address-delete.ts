"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
  addressId: z.string().min(1, { message: "Address ID is required" }),
});

export const deleteAddress = async (
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
      "address-delete"
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

    const { addressId } = inputSchema.parse({
      addressId: String(formData.get("addressId") ?? ""),
    });

    const addressToDelete = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!addressToDelete) {
      return toActionState("ERROR", "Address not found", formData);
    }

    const deleted = await prisma.address.delete({
      where: { id: addressId },
    });

    await createAuditLog({
      orgId: org.org?.id ?? "",
      actorId: user.userId,
      action: "ADDRESS_DELETED",
      entityType: "ADDRESS",
      entityId: addressId,
      beforeJSON: JSON.parse(JSON.stringify(deleted)),
    });

    revalidatePath("/departments/[departmentId]/[teamId]/processes/address");

    return toActionState("SUCCESS", "Address deleted successfully", formData, {
      address: deleted,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};