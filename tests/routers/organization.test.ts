import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

vi.mock("@/lib/deploy-mode", () => ({
  isCloud: vi.fn().mockReturnValue(false),
  isSelfHosted: vi.fn().mockReturnValue(true),
}));

vi.mock("@/features/audit/utils/audit", () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { isCloud, isSelfHosted } from "@/lib/deploy-mode";
import { AI_SELF_HOSTED_ONLY_USER } from "@/lib/ai/ai-enabled";
import { organizationRouter } from "@/server/trpc/routers/organization";
import type { Context } from "@/server/trpc/context";
import {
  ORG_NAME_ALPHANUMERIC_MESSAGE,
  ORG_NAME_MIN_MESSAGE,
} from "@/lib/org-name";

function createCallerContext(
  overrides: Partial<Omit<Context, "db">> & { db: Record<string, unknown> },
): Context {
  return {
    user: { id: "user-1", email: "test@example.com", name: "Test User" },
    org: {
      id: "org-1",
      name: "Test Org",
      slug: "test-org",
    } as NonNullable<Context["org"]>,
    membership: { role: "ADMIN" } as NonNullable<Context["membership"]>,
    isAdmin: true,
    hasActiveAccess: true,
    accessLevel: "full",
    graceEndsAt: null,
    isDemo: false,
    ...overrides,
    db: overrides.db as unknown as Context["db"],
  } as Context;
}

describe("Organization Router - input validation", () => {
  let mockFindFirst: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst = vi.fn();
    mockUpdate = vi.fn();
  });

  describe("createOrganization", () => {
    it("rejects names shorter than the minimum before DB access", async () => {
      const caller = organizationRouter.createCaller(
        createCallerContext({
          db: { orgMembership: { findFirst: mockFindFirst } },
        }),
      );

      await expect(
        caller.createOrganization({ name: "AB" }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(ORG_NAME_MIN_MESSAGE),
      });

      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it("rejects punctuation-only names before DB access", async () => {
      const caller = organizationRouter.createCaller(
        createCallerContext({
          db: { orgMembership: { findFirst: mockFindFirst } },
        }),
      );

      await expect(
        caller.createOrganization({ name: "---" }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(ORG_NAME_ALPHANUMERIC_MESSAGE),
      });

      expect(mockFindFirst).not.toHaveBeenCalled();
    });
  });

  describe("renameOrganization", () => {
    it("rejects names shorter than the minimum before DB access", async () => {
      const caller = organizationRouter.createCaller(
        createCallerContext({
          db: { organization: { update: mockUpdate } },
        }),
      );

      await expect(
        caller.renameOrganization({ orgName: "AB" }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(ORG_NAME_MIN_MESSAGE),
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});

describe("Organization Router - AI self-hosted only", () => {
  let mockOrgFindUnique: ReturnType<typeof vi.fn>;
  let mockOrgUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isCloud).mockReturnValue(true);
    vi.mocked(isSelfHosted).mockReturnValue(false);

    mockOrgFindUnique = vi.fn();
    mockOrgUpdate = vi.fn();
  });

  afterEach(() => {
    vi.mocked(isCloud).mockReturnValue(false);
    vi.mocked(isSelfHosted).mockReturnValue(true);
  });

  it("getAiAvailability returns aiEnabled false on cloud without DB read", async () => {
    const caller = organizationRouter.createCaller(
      createCallerContext({
        db: {
          organization: {
            findUnique: mockOrgFindUnique,
            update: mockOrgUpdate,
          },
        },
      }),
    );
    const result = await caller.getAiAvailability();

    expect(result).toEqual({ aiEnabled: false, keysConfigured: false });
    expect(mockOrgFindUnique).not.toHaveBeenCalled();
  });

  it("saveAiKeys is FORBIDDEN on cloud", async () => {
    const caller = organizationRouter.createCaller(
      createCallerContext({
        db: {
          organization: {
            findUnique: mockOrgFindUnique,
            update: mockOrgUpdate,
          },
        },
      }),
    );

    await expect(
      caller.saveAiKeys({ anthropicApiKey: "sk-test-key" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: AI_SELF_HOSTED_ONLY_USER,
    } satisfies Partial<TRPCError>);

    expect(mockOrgUpdate).not.toHaveBeenCalled();
  });
});
