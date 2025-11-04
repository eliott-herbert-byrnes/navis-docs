"use server";

import { ideasPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IdeaStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateIdeaStatus = async (
  ideaId: string,
  status: IdeaStatus
): Promise<ActionState> => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized");
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Only admins can update ideas");
    }

    await prisma.idea.update({
      where: { id: ideaId },
      data: { status },
    });

    
    const statusLabel =
    status === "COMPLETED"
    ? "completed"
    : status === "ARCHIVED"
    ? "archived"
    : "updated";
    
    revalidatePath(ideasPath());

    return toActionState("SUCCESS", `Idea ${statusLabel}`);
  } catch (error) {
    return fromErrorToActionState(error);
  }
};

