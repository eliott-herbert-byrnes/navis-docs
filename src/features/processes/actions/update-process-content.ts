"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inputSchema = z.object({
  processId: z.uuid(),
  versionId: z.uuid(),
  contentJSON: z.any(),
});

export async function updateProcessContent(
  _actionState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const processId = String(formData.get("processId") ?? "");
    const versionId = String(formData.get("versionId") ?? "");
    const contentJSONString = String(formData.get("contentJSON") ?? "{}");

    let contentJSON;
    try {
      contentJSON = JSON.parse(contentJSONString);
    } catch (error) {
      return toActionState("ERROR", "Invalid content JSON", formData);
    }

    const parsed = inputSchema.parse({
      processId,
      versionId,
      contentJSON,
    });

    const process = await prisma.process.findUnique({
      where: { id: parsed.processId },
      include: { pendingVersion: true },
    });
    if (!process) {
      return toActionState("ERROR", "Process not found", formData);
    }

    if (
      !process.pendingVersion ||
      process.pendingVersion.id !== parsed.versionId
    ) {
      return toActionState(
        "ERROR",
        "Version not found or not pending",
        formData
      );
    }

    await prisma.processVersion.update({
      where: { id: parsed.versionId },
      data: { contentJSON: parsed.contentJSON },
    });

    return toActionState(
      "SUCCESS",
      "Process content updated successfully",
      formData
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
