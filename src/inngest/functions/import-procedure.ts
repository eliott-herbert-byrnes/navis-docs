import { inngest } from "../client";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import mammoth from "mammoth";
import { getAnthropic } from "@/lib/ai/anthropic";
import { Prisma } from "@prisma/client";

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

export type EventImportProcedure = {
  data: {
    jobId: string;
    fileKey: string;
    orgId: string;
    procedureId: string;
    actorId: string;
    sourceType: "FILE_TXT" | "FILE_DOCX";
  };
};

export const eventImportProcedure = inngest.createFunction(
  {
    id: "import-file",
  },
  {
    event: "procedure/import-file",
  },
  async ({ event }) => {
    const { jobId, fileKey, orgId, procedureId, actorId, sourceType } =
      event.data;

    try {
      // Begin parsing process, and update status
      await prisma.ingestionJob.update({
        where: { id: jobId },
        data: { status: "PARSING" },
      });

      // Download procedure
      const BUCKET =
        process.env.SUPABASE_PROCEDURE_IMPORTS_BUCKET ?? "procedure-imports";

      const { data: fileData, error: downloadError } =
        await supabaseAdmin.storage.from(BUCKET).download(fileKey);

      if (downloadError || !fileData) {
        throw new Error("Failed to download import file from storage");
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract plain text from buffer (TXT vs DOCX)
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

      // Call Anthropic to get TipTap JSON
      await prisma.ingestionJob.update({
        where: { id: jobId },
        data: { status: "GENERATING" },
      });

      const client = getAnthropic();
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

      // Parse Response
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

      // Create Procedure
      const version = await prisma.procedureVersion.create({
        data: {
          procedureId,
          createdBy: actorId,
          style: "RAW",
          contentJSON: contentJSON as Prisma.InputJsonValue,
          // optional: contentText for embeddings later
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

      // Best-effort: try to mark the job as FAILED with error message
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
  },
);
