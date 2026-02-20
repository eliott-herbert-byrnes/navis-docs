import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateAuditLog = vi.fn();
const mockSupabaseRemove = vi.fn();

vi.mock("@/features/audit/utils/audit", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    storage: {
      from: () => ({
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
              src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fold.png",
            },
          },
          {
            type: "image",
            attrs: {
              src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fkeep.png",
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
              src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fkeep.png",
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
    });
    mockVersionUpdate.mockResolvedValue({
      id: "11111111-1111-1111-8111-111111111111",
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
      "orgs/org-1/procedures/proc-1/old.png",
    ]);
  });
});
