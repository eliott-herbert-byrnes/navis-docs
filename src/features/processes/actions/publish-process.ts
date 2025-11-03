"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProcessStatus } from "@prisma/client";
import { z } from "zod";

const inputSchema = z.object({
  processId: z.uuid(),
});

export async function publishProcess(
  _actionState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const org = await getUserOrg(user.userId);
    if (!org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const processId = String(formData.get("processId") ?? "");

    const parsed = inputSchema.parse({
      processId,
    });

    const process = await prisma.process.findUnique({
      where: { id: parsed.processId },
      include: {
        pendingVersion: true,
        publishedVersion: true,
      },
    });

    if (!process) {
      return toActionState("ERROR", "Process not found", formData);
    }

    if (!process.pendingVersion) {
      return toActionState("ERROR", "No pending version to publish", formData);
    }

    const contentText = generatePlainTextFromTiptap(
      process.pendingVersion.contentJSON
    );

    await prisma.processVersion.update({
      where: { id: process.pendingVersion.id },
      data: {
        contentText,
      },
    });

    await prisma.process.update({
      where: { id: parsed.processId },
      data: {
        status: ProcessStatus.PUBLISHED,
        publishedVersionId: process.pendingVersion.id,
      },
    });

    await createAuditLog({
      orgId: org.id,
      actorId: user.userId,
      action: "PROCESS_PUBLISHED",
      entityType: "PROCESS",
      entityId: process.id,
      beforeJSON: {
        status: process.status,
        publishedVersionId: process.publishedVersionId,
      },
      afterJSON: {
        status: ProcessStatus.PUBLISHED,
        publishedVersionId: process.pendingVersion.id,
      },
    });

    return toActionState("SUCCESS", "Process published successfully", formData);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}

function generatePlainTextFromTiptap(contentJSON: any): string {
  if (!contentJSON || typeof contentJSON !== "object") {
    return "";
  }

  let text = "";

  function extractText(node: any): void {
    if (!node) return;

    if (node.text) {
      text += node.text;
    }

    if (Array.isArray(node.content)) {
      node.content.forEach((child: any) => {
        extractText(child);
        if (
          child.type === "paragraph" ||
          child.type === "heading" ||
          child.type === "listItem"
        ) {
          text += "\n";
        }
      });
    }
  }

  if (contentJSON.tiptap) {
    extractText(contentJSON.tiptap);
  } else {
    extractText(contentJSON);
  }

  return text.trim();
}
