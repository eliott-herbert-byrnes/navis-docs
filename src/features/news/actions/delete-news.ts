"use server";

import { errorsPath, newsPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteNewsPost = async (
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
        return toActionState("ERROR", "Only admins can delete news posts", formData);
    }

    const departmentId = String(formData.get("departmentId") ?? "");
    const teamId = String(formData.get("teamId") ?? "");

    const deleted = await prisma.newsPost.delete({
      where: { id: formData.get("newsPostId") as string },
    });

    revalidatePath(newsPath(departmentId, teamId), "layout");

    return toActionState("SUCCESS", "News post deleted", formData, {
      newsPost: deleted,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};

