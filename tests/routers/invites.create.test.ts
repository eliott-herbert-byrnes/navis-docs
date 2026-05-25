import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

vi.mock("@/features/audit/utils/audit", () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/stripe/sync-seats", () => ({
  syncStripeSeats: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<p>invite</p>"),
}));

vi.mock("@/lib/email", () => ({
  getEmailFrom: () => "Navis Docs <no-reply@test.com>",
}));

const mockSend = vi.fn();

vi.mock("@/lib/resend", () => ({
  getResend: () => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  }),
}));

import { invitesRouter } from "@/server/trpc/routers/invites";

describe("Invites Router - createInvitation", () => {
  let mockContext: any;
  let mockFindFirst: ReturnType<typeof vi.fn>;
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst = vi.fn();
    mockCreate = vi.fn();
    mockDelete = vi.fn();
    mockSend.mockResolvedValue({ error: null });

    mockContext = {
      db: {
        invitation: {
          findFirst: mockFindFirst,
          create: mockCreate,
          delete: mockDelete,
        },
      },
      user: { id: "user-1", email: "admin@test.com" },
      org: { id: "org-1", name: "Test Org", slug: "test-org" },
      membership: { role: "ADMIN" },
      isAdmin: true,
      hasActiveAccess: true,
    };

    process.env.NEXTAUTH_URL = "https://app.test.com";
  });

  it("creates an invitation and sends email", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      email: "member@test.com",
      role: "MEMBER",
      expiresAt: new Date("2026-06-01T00:00:00.000Z"),
    });

    const caller = invitesRouter.createCaller(mockContext);
    const result = await caller.createInvitation({ email: "member@test.com" });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: "org-1",
          email: "member@test.com",
          status: "PENDING",
        }),
      }),
    );
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "member@test.com",
        subject: expect.stringContaining("Test Org"),
      }),
    );
    expect(result.message).toBe("Invite successfully created");
  });

  it("rolls back the invite when email delivery fails", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      email: "member@test.com",
      role: "MEMBER",
      expiresAt: new Date(),
    });
    mockSend.mockResolvedValue({ error: { message: "smtp down" } });

    const caller = invitesRouter.createCaller(mockContext);

    await expect(
      caller.createInvitation({ email: "member@test.com" }),
    ).rejects.toThrow(TRPCError);

    expect(mockDelete).toHaveBeenCalledWith({
      where: {
        invitationId: {
          orgId: "org-1",
          canonicalEmail: "member@test.com",
        },
      },
    });
  });
});
