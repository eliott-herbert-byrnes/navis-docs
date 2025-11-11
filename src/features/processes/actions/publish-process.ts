"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { generateProcessEmbeddings } from "@/features/ai/actions/generate-embeddings";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrg, getUserOrgWithRole, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProcessStatus } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
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

    const {org, isAdmin} = await getUserOrgWithRole(user.userId);
    if (!org || !isAdmin) {
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
      process.pendingVersion.contentJSON as JsonObject
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

    try {
      await generateProcessEmbeddings(parsed.processId);
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
    }

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

function generatePlainTextFromTiptap(contentJSON: JsonObject): string {
  if (!contentJSON || typeof contentJSON !== "object") {
    return "";
  }

  let text = "";

  function extractText(node: JsonObject): void {
    if (!node) return;

    if (node.text) {
      text += node.text;
    }

    if (Array.isArray(node.content)) {
      node.content.forEach((child) => {
        if (typeof child === "object" && child !== null) {
          extractText(child as JsonObject);
          if (
            (child as { type?: string }).type === "paragraph" ||
            (child as { type?: string }).type === "heading" ||
          (child as { type?: string }).type === "listItem"
        ) {
          text += "\n";
        }
        }
      });
    }
  }

  extractText(contentJSON.tiptap as JsonObject);

  return text.trim();
}
