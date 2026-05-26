import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/deploy-mode", () => ({
  isCloud: vi.fn().mockReturnValue(false),
}));

vi.mock("@/features/audit/utils/audit", () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { organizationRouter } from "@/server/trpc/routers/organization";
import {
  ORG_NAME_ALPHANUMERIC_MESSAGE,
  ORG_NAME_MIN_MESSAGE,
} from "@/lib/org-name";

describe("Organization Router - input validation", () => {
  let mockFindFirst: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let createContext: {
    db: { orgMembership: { findFirst: ReturnType<typeof vi.fn> } };
    user: { id: string; email: string };
  };
  let renameContext: {
    db: { organization: { update: ReturnType<typeof vi.fn> } };
    user: { id: string };
    org: { id: string; name: string; slug: string };
    membership: { role: string };
    isAdmin: boolean;
    hasActiveAccess: boolean;
    isDemo: boolean;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst = vi.fn();
    mockUpdate = vi.fn();

    createContext = {
      db: {
        orgMembership: { findFirst: mockFindFirst },
      },
      user: { id: "user-1", email: "test@example.com" },
    };

    renameContext = {
      db: {
        organization: { update: mockUpdate },
      },
      user: { id: "user-1" },
      org: { id: "org-1", name: "Test Org", slug: "test-org" },
      membership: { role: "ADMIN" },
      isAdmin: true,
      hasActiveAccess: true,
      isDemo: false,
    };
  });

  describe("createOrganization", () => {
    it("rejects names shorter than the minimum before DB access", async () => {
      const caller = organizationRouter.createCaller(createContext);

      await expect(
        caller.createOrganization({ name: "AB" }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(ORG_NAME_MIN_MESSAGE),
      });

      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it("rejects punctuation-only names before DB access", async () => {
      const caller = organizationRouter.createCaller(createContext);

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
      const caller = organizationRouter.createCaller(renameContext);

      await expect(
        caller.renameOrganization({ orgName: "AB" }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(ORG_NAME_MIN_MESSAGE),
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
