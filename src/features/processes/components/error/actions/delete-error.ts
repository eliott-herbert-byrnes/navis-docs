"use server";

import { errorsPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteError = async (
  _actionState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Only admins can delete error reports", formData);
    }

    await prisma.errorReport.delete({
      where: { id: formData.get("errorId") as string },
    });

    revalidatePath(errorsPath());

    return toActionState("SUCCESS", "Error report deleted", formData);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};

