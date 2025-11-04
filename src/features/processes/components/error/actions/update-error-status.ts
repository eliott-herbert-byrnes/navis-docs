"use server";

import { errorsPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ErrorReportStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateErrorStatus = async (
  errorId: string,
  status: ErrorReportStatus
): Promise<ActionState> => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized");
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Only admins can update error reports");
    }

    await prisma.errorReport.update({
      where: { id: errorId },
      data: { status },
    });

    
    const statusLabel =
    status === "RESOLVED"
    ? "completed"
    : status === "ARCHIVED"
    ? "archived"
    : "updated";
    
    revalidatePath(errorsPath());

    return toActionState("SUCCESS", `Error report ${statusLabel}`);
  } catch (error) {
    return fromErrorToActionState(error);
  }
};

