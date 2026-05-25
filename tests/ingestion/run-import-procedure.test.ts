import { beforeEach, describe, expect, it, vi } from "vitest";

const mockJobUpdate = vi.fn();
const mockVersionCreate = vi.fn();
const mockDownload = vi.fn();
const mockMessagesCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ingestionJob: {
      update: (...args: unknown[]) => mockJobUpdate(...args),
    },
    procedureVersion: {
      create: (...args: unknown[]) => mockVersionCreate(...args),
    },
  },
}));

vi.mock("@/lib/storage", () => ({
  storage: {
    download: (...args: unknown[]) => mockDownload(...args),
  },
}));

vi.mock("@/lib/ai/resolve-org-ai-keys", () => ({
  resolveOrgAiKeys: vi.fn().mockResolvedValue({
    cloudEntitled: true,
    anthropicKey: "sk-test",
    openAiKey: null,
  }),
}));

vi.mock("@/lib/deploy-mode", () => ({
  isCloud: vi.fn(() => false),
}));

vi.mock("@/lib/ai/anthropic", () => ({
  getAnthropic: vi.fn(() => ({
    messages: {
      create: (...args: unknown[]) => mockMessagesCreate(...args),
    },
  })),
}));

import { runImportProcedure } from "@/features/procedures/jobs/run-import-procedure";

describe("runImportProcedure", () => {
  const baseParams = {
    jobId: "job-1",
    fileKey: "org/import.txt",
    orgId: "org-1",
    procedureId: "proc-1",
    actorId: "user-1",
    sourceType: "FILE_TXT" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockJobUpdate.mockResolvedValue({});
    mockVersionCreate.mockResolvedValue({ id: "version-1" });
    mockDownload.mockResolvedValue(
      Buffer.from("Hello import\n\nSecond paragraph", "utf-8"),
    );
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Hello import" }],
              },
            ],
          }),
        },
      ],
    });
  });

  it("parses a text file, generates content, and marks the job READY", async () => {
    await runImportProcedure(baseParams);

    expect(mockJobUpdate).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: { status: "PARSING" },
    });
    expect(mockJobUpdate).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: { status: "GENERATING" },
    });
    expect(mockVersionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          procedureId: "proc-1",
          createdBy: "user-1",
          contentText: expect.stringContaining("Hello import"),
        }),
      }),
    );
    expect(mockJobUpdate).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: {
        status: "READY",
        outputVersionId: "version-1",
      },
    });
  });

  it("marks the job FAILED when the import file is empty", async () => {
    mockDownload.mockResolvedValue(Buffer.from("   \n", "utf-8"));

    await expect(runImportProcedure(baseParams)).rejects.toThrow(
      "Import file is empty after parsing",
    );

    expect(mockJobUpdate).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: expect.objectContaining({
        status: "FAILED",
        error: "Import file is empty after parsing",
      }),
    });
  });

  it("falls back to plain-text paragraphs when AI JSON is invalid", async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: "text", text: "not-json" }],
    });

    await runImportProcedure(baseParams);

    expect(mockVersionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contentJSON: expect.objectContaining({
            tiptap: expect.objectContaining({ type: "doc" }),
          }),
        }),
      }),
    );
  });
});
