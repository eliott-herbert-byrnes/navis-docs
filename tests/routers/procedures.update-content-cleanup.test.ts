import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateAuditLog = vi.fn();
const mockSupabaseRemove = vi.fn();
const mockSupabaseList = vi.fn();

vi.mock("@/features/audit/utils/audit", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    storage: {
      from: () => ({
        list: (...args: unknown[]) => mockSupabaseList(...args),
        remove: (...args: unknown[]) => mockSupabaseRemove(...args),
      }),
    },
  },
}));

import { procedureRouter } from "@/server/trpc/routers/procedures";

describe("procedures.updateProcedureContent image cleanup", () => {
  let mockContext: any;
  let mockFindUnique: ReturnType<typeof vi.fn>;
  let mockVersionUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFindUnique = vi.fn();
    mockVersionUpdate = vi.fn();

    mockContext = {
      db: {
        procedure: {
          findUnique: mockFindUnique,
        },
        procedureVersion: {
          update: mockVersionUpdate,
        },
      },
      user: { id: "user-1" },
      org: { id: "org-1" },
      isAdmin: true,
    };
  });

  it("removes managed image paths no longer present in updated content", async () => {
    const oldContent = {
      tiptap: {
        type: "doc",
        content: [
          {
            type: "image",
            attrs: {
              src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2F8f4d4470-4f6b-4b9a-a2dc-f1ca74b04801%2Fold.png",
            },
          },
          {
            type: "image",
            attrs: {
              src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2F8f4d4470-4f6b-4b9a-a2dc-f1ca74b04801%2Fkeep.png",
            },
          },
        ],
      },
    };

    const newContent = {
      tiptap: {
        type: "doc",
        content: [
          {
            type: "image",
            attrs: {
              src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2F8f4d4470-4f6b-4b9a-a2dc-f1ca74b04801%2Fkeep.png",
            },
          },
        ],
      },
    };

    mockFindUnique.mockResolvedValue({
      id: "proc-1",
      pendingVersion: {
        id: "11111111-1111-1111-8111-111111111111",
        contentJSON: oldContent,
      },
      publishedVersion: null,
    });
    mockVersionUpdate.mockResolvedValue({
      id: "11111111-1111-1111-8111-111111111111",
    });
    mockSupabaseList.mockResolvedValue({
      data: [{ name: "old.png" }, { name: "keep.png" }],
      error: null,
    });
    mockSupabaseRemove.mockResolvedValue({ error: null });
    mockCreateAuditLog.mockResolvedValue(undefined);

    const caller = procedureRouter.createCaller(mockContext);
    await caller.updateProcedureContent({
      procedureId: "8f4d4470-4f6b-4b9a-a2dc-f1ca74b04801",
      versionId: "11111111-1111-1111-8111-111111111111",
      contentJSON: newContent,
    });

    expect(mockSupabaseRemove).toHaveBeenCalledWith([
      "orgs/org-1/procedures/8f4d4470-4f6b-4b9a-a2dc-f1ca74b04801/old.png",
    ]);
  });

  it("removes uploaded-but-unsaved image left in procedure folder", async () => {
    const oldContent = {
      tiptap: { type: "doc", content: [{ type: "paragraph" }] },
    };
    const newContent = {
      tiptap: { type: "doc", content: [{ type: "paragraph" }] },
    };

    mockFindUnique.mockResolvedValue({
      id: "proc-1",
      pendingVersion: {
        id: "11111111-1111-1111-8111-111111111111",
        contentJSON: oldContent,
      },
      publishedVersion: null,
    });
    mockVersionUpdate.mockResolvedValue({
      id: "11111111-1111-1111-8111-111111111111",
    });
    mockSupabaseList.mockResolvedValue({
      data: [{ name: "temp-upload.png" }],
      error: null,
    });
    mockSupabaseRemove.mockResolvedValue({ error: null });
    mockCreateAuditLog.mockResolvedValue(undefined);

    const caller = procedureRouter.createCaller(mockContext);
    await caller.updateProcedureContent({
      procedureId: "8f4d4470-4f6b-4b9a-a2dc-f1ca74b04801",
      versionId: "11111111-1111-1111-8111-111111111111",
      contentJSON: newContent,
    });

    expect(mockSupabaseRemove).toHaveBeenCalledWith([
      "orgs/org-1/procedures/8f4d4470-4f6b-4b9a-a2dc-f1ca74b04801/temp-upload.png",
    ]);
  });
});
