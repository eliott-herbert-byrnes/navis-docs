"use server";

import { ideasPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";

export const deleteIdea = async (
  _actionState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const { success } = await getLimitByUser(
      deleteLimiter,
      user.userId,
      "idea-delete"
    );
    if (!success) {
      return toActionState("ERROR", "Too many requests", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Only admins can delete error reports", formData);
    }

    await prisma.idea.delete({
      where: { id: formData.get("ideaId") as string },
    });

    revalidatePath(ideasPath());

    return toActionState("SUCCESS", "Error report deleted", formData);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};

