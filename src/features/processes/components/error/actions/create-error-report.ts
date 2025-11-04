"use server";

import { errorsPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
  processId: z.string().min(1, { message: "Is Required" }),
  errorReport: z.string().min(1, { message: "Is Required" }).max(1000),
});

export const createErrorReport = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const org = await getUserOrg(user.userId);
    if (!org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const parsed = inputSchema.parse({
      processId: formData.get("processId") as string,
      errorReport: formData.get("errorReport") as string,
    });

    const { processId, errorReport: errorBody } = parsed;

    const createdReport = await prisma.errorReport.create({
      data: {
        processId,
        createdBy: user.userId,
        body: errorBody,
        status: "OPEN",
      },
    });

    revalidatePath("/departments", "layout");
    const successState = toActionState(
      "SUCCESS",
      "Error report submitted successfully",
      formData
    );
    revalidatePath(errorsPath());
    return successState;
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
