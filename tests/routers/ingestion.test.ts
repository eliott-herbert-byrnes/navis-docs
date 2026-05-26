import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

vi.mock("@/lib/deploy-mode", () => ({
  isCloud: vi.fn().mockReturnValue(false),
  isSelfHosted: vi.fn().mockReturnValue(true),
}));

vi.mock("@/features/audit/utils/audit", () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/server", () => ({
  after: vi.fn((fn: () => Promise<void>) => {
    void fn();
  }),
}));

vi.mock("@/features/procedures/jobs/run-import-procedure", () => ({
  runImportProcedure: vi.fn().mockResolvedValue(undefined),
}));

import { isCloud, isSelfHosted } from "@/lib/deploy-mode";
import { AI_SELF_HOSTED_ONLY_USER } from "@/lib/ai/ai-enabled";
import { ingestionRouter } from "@/server/trpc/routers/ingestion";

describe("Ingestion Router", () => {
  let mockContext: any;
  let mockTeamFindFirst: ReturnType<typeof vi.fn>;
  let mockProcedureFindFirst: ReturnType<typeof vi.fn>;
  let mockProcedureCreate: ReturnType<typeof vi.fn>;
  let mockJobCreate: ReturnType<typeof vi.fn>;
  let mockJobFindFirst: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTeamFindFirst = vi.fn();
    mockProcedureFindFirst = vi.fn();
    mockProcedureCreate = vi.fn();
    mockJobCreate = vi.fn();
    mockJobFindFirst = vi.fn();

    mockContext = {
      db: {
        team: { findFirst: mockTeamFindFirst },
        procedure: {
          findFirst: mockProcedureFindFirst,
          create: mockProcedureCreate,
        },
        ingestionJob: {
          create: mockJobCreate,
          findFirst: mockJobFindFirst,
        },
      },
      user: { id: "user-1", email: "admin@test.com" },
      org: { id: "org-1", slug: "test-org" },
      membership: { role: "ADMIN" },
      isAdmin: true,
      hasActiveAccess: true,
    };
  });

  it("startImport creates a queued job for a valid team", async () => {
    mockTeamFindFirst.mockResolvedValue({ id: "team-1" });
    mockProcedureFindFirst.mockResolvedValue(null);
    mockProcedureCreate.mockResolvedValue({ id: "proc-1" });
    mockJobCreate.mockResolvedValue({ id: "job-1" });

    const caller = ingestionRouter.createCaller(mockContext);
    const result = await caller.startImport({
      title: "Imported SOP",
      teamId: "team-1",
      departmentId: "dept-1",
      fileKey: "org/file.txt",
      sourceType: "FILE_TXT",
    });

    expect(result).toEqual({ jobId: "job-1" });
    expect(mockJobCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: "org-1",
          procedureId: "proc-1",
          status: "QUEUED",
        }),
      }),
    );
  });

  it("getJobStatus scopes jobs to the current org", async () => {
    mockJobFindFirst.mockResolvedValue({
      status: "READY",
      error: null,
      fileKey: "org/onboarding.docx",
      procedure: {
        id: "proc-1",
        title: "Imported SOP",
        teamId: "team-1",
        team: { departmentId: "dept-1" },
      },
      outputVersion: {
        contentJSON: {
          tiptap: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Preview text" }],
              },
            ],
          },
        },
      },
    });

    const caller = ingestionRouter.createCaller(mockContext);
    const result = await caller.getJobStatus({
      jobId: "00000000-0000-4000-8000-000000000001",
    });

    expect(mockJobFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "00000000-0000-4000-8000-000000000001",
          orgId: "org-1",
        },
      }),
    );
    expect(result.status).toBe("READY");
    expect(result.contentPreview).toContain("Preview text");
    expect(result.filename).toBe("onboarding.docx");
  });

  it("getJobStatus returns NOT_FOUND for missing jobs", async () => {
    mockJobFindFirst.mockResolvedValue(null);

    const caller = ingestionRouter.createCaller(mockContext);

    await expect(
      caller.getJobStatus({
        jobId: "00000000-0000-4000-8000-000000000099",
      }),
    ).rejects.toThrow(TRPCError);
  });

  it("startImport is FORBIDDEN on cloud", async () => {
    vi.mocked(isCloud).mockReturnValue(true);
    vi.mocked(isSelfHosted).mockReturnValue(false);

    const caller = ingestionRouter.createCaller(mockContext);

    await expect(
      caller.startImport({
        title: "Imported SOP",
        teamId: "team-1",
        departmentId: "dept-1",
        fileKey: "org/file.txt",
        sourceType: "FILE_TXT",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: AI_SELF_HOSTED_ONLY_USER,
    } satisfies Partial<TRPCError>);

    expect(mockTeamFindFirst).not.toHaveBeenCalled();
    expect(mockJobCreate).not.toHaveBeenCalled();
  });
});
