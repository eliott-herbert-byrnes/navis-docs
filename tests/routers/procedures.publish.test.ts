import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProcedureStatus } from "@prisma/client";

vi.mock("@/features/audit/utils/audit", () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/ai/actions/generate-embeddings", () => ({
  generateProcedureEmbeddings: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    storage: {
      from: () => ({
        remove: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  },
}));

import { procedureRouter } from "@/server/trpc/routers/procedures";

describe("Procedure Router - publishProcedure", () => {
  const procedureId = "4f8d4d1a-2b9f-4f3b-b8f2-043b52ea7a77";
  const versionId = "7c4a4b6e-2d3b-4f31-9d13-eec12ab8d7c1";

  let mockContext: any;
  let mockFindUnique: ReturnType<typeof vi.fn>;
  let mockVersionUpdate: ReturnType<typeof vi.fn>;
  let mockProcedureUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFindUnique = vi.fn();
    mockVersionUpdate = vi.fn();
    mockProcedureUpdate = vi.fn();

    mockContext = {
      db: {
        procedure: {
          findUnique: mockFindUnique,
          update: mockProcedureUpdate,
        },
        procedureVersion: {
          update: mockVersionUpdate,
        },
      },
      user: { id: "user-1", email: "test@example.com" },
      org: { id: "org-1", slug: "org" },
      membership: { role: "ADMIN" },
      isAdmin: true,
    };
  });

  it("publishes a procedure and stores extracted step heading/description in contentText", async () => {
    mockFindUnique.mockResolvedValue({
      id: procedureId,
      status: "DRAFT",
      publishedVersionId: null,
      pendingVersion: {
        id: versionId,
        contentJSON: {
          tiptap: {
            type: "doc",
            content: [
              {
                type: "orderedList",
                attrs: { listType: "steps" },
                content: [
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "heading",
                        attrs: { level: 2 },
                        content: [{ type: "text", text: "Step 1" }],
                      },
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Open settings." }],
                      },
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Confirm changes are saved." }],
                  },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      publishedVersion: null,
    });

    mockVersionUpdate.mockResolvedValue({ id: versionId });
    mockProcedureUpdate.mockResolvedValue({ id: procedureId });

    const caller = procedureRouter.createCaller(mockContext);
    await caller.publishProcedure({ procedureId });

    expect(mockVersionUpdate).toHaveBeenCalledTimes(1);
    expect(mockVersionUpdate).toHaveBeenCalledWith({
      where: { id: versionId },
      data: {
        contentText: expect.stringContaining("Step 1"),
      },
    });
    expect(mockVersionUpdate.mock.calls[0][0].data.contentText).toContain(
      "Open settings.",
    );
    expect(mockVersionUpdate.mock.calls[0][0].data.contentText).toContain(
      "Confirm changes are saved.",
    );
    expect(mockVersionUpdate.mock.calls[0][0].data.contentText).not.toContain(
      "add new step",
    );
    expect(mockProcedureUpdate).toHaveBeenCalledWith({
      where: { id: procedureId },
      data: {
        status: ProcedureStatus.PUBLISHED,
        publishedVersionId: versionId,
      },
    });
  });
});
