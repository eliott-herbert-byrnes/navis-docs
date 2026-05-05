import { getAnthropic } from "@/lib/ai/anthropic";
import { resolveOrgAiKeys } from "@/lib/ai/resolve-org-ai-keys";
import { isCloud } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { Prisma } from "@prisma/client";
import mammoth from "mammoth";

/** Minimal check that parsed AI output looks like a Tiptap doc we can store. */
function isTiptapDoc(
  value: unknown,
): value is { type: "doc"; content: unknown[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as { type: string }).type === "doc" &&
    "content" in value &&
    Array.isArray((value as { content: unknown }).content)
  );
}

/** Build a safe fallback Tiptap doc from plain text (paragraphs only). */
function buildFallbackTiptapDoc(plainText: string): {
  type: "doc";
  content: unknown[];
} {
  return {
    type: "doc",
    content: plainText
      .split(/\n\n+/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => ({
        type: "paragraph",
        content: [{ type: "text", text: para }],
      })),
  };
}

export type RunImportProcedureParams = {
  jobId: string;
  fileKey: string;
  orgId: string;
  procedureId: string;
  actorId: string;
  sourceType: "FILE_TXT" | "FILE_DOCX";
};

export async function runImportProcedure({
  jobId,
  fileKey,
  orgId,
  procedureId,
  actorId,
  sourceType,
}: RunImportProcedureParams): Promise<void> {
  try {
    await prisma.ingestionJob.update({
      where: { id: jobId },
      data: { status: "PARSING" },
    });

    const BUCKET =
      process.env.SUPABASE_PROCEDURE_IMPORTS_BUCKET ?? "procedure-imports";

    const buffer = await storage.download(BUCKET, fileKey);

    let plainText = "";

    if (sourceType === "FILE_TXT") {
      plainText = buffer.toString("utf-8");
    } else if (sourceType === "FILE_DOCX") {
      const { value } = await mammoth.extractRawText({ buffer });
      plainText = value;
    } else {
      throw new Error(`Unsupported sourceType: ${sourceType}`);
    }

    plainText = plainText.trim();
    if (!plainText) {
      throw new Error("Import file is empty after parsing");
    }

    await prisma.ingestionJob.update({
      where: { id: jobId },
      data: { status: "GENERATING" },
    });

    const resolved = await resolveOrgAiKeys(orgId);
    if (!resolved.cloudEntitled) {
      throw new Error(
        "AI import requires an active Pro or Enterprise subscription.",
      );
    }

    let anthropicApiKey: string | undefined;
    if (isCloud()) {
      if (!resolved.anthropicKey) {
        throw new Error(
          "No Anthropic API key configured. Add your key in Settings → AI Configuration.",
        );
      }
      anthropicApiKey = resolved.anthropicKey;
    } else {
      anthropicApiKey = resolved.anthropicKey ?? undefined;
      if (!anthropicApiKey && !process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          "No Anthropic API key configured. Add your key in Settings → AI Configuration or set ANTHROPIC_API_KEY.",
        );
      }
    }

    const client = getAnthropic(anthropicApiKey);
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      temperature: 0,
      system:
        "You are a document-to-JSON converter. Return ONLY valid JSON. No markdown, no explanation.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Convert this text into a Tiptap JSON doc object.\n" +
                "Rules:\n" +
                '- Root must be: { "type": "doc", "content": [...] }\n' +
                '- Use "paragraph", "heading" (attrs.level 1-3), "bulletList", "orderedList", "listItem", "text" node types\n' +
                '- Every "text" node has a "text" string property\n' +
                '- listItem content must contain a "paragraph\n' +
                "- Preserve headings, lists, and paragraph breaks from the source\n" +
                "- Best-effort is fine; flat paragraphs are acceptable for unclear structure\n\n" +
                "Document:\n" +
                plainText,
            },
          ],
        },
      ],
    });

    const rawJsonText =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    let tiptapDoc: { type: "doc"; content: unknown[] };

    try {
      const parsed: unknown = JSON.parse(rawJsonText);
      if (isTiptapDoc(parsed)) {
        tiptapDoc = parsed;
      } else {
        tiptapDoc = buildFallbackTiptapDoc(plainText);
      }
    } catch {
      tiptapDoc = buildFallbackTiptapDoc(plainText);
    }

    const contentJSON = { tiptap: tiptapDoc };

    const version = await prisma.procedureVersion.create({
      data: {
        procedureId,
        createdBy: actorId,
        style: "RAW",
        contentJSON: contentJSON as Prisma.InputJsonValue,
        contentText: plainText,
      },
    });

    await prisma.ingestionJob.update({
      where: { id: jobId },
      data: {
        status: "READY",
        outputVersionId: version.id,
      },
    });
  } catch (error) {
    console.error("Import procedure job failed:", error);

    try {
      await prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          error:
            error instanceof Error ? error.message : "Unknown import error",
        },
      });
    } catch (inner) {
      console.error("Failed to update IngestionJob status to FAILED:", inner);
    }

    throw error;
  }
}
