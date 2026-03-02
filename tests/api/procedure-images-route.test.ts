import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockFindFirstMembership = vi.fn();
const mockFindFirstProcedure = vi.fn();
const mockDownload = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    orgMembership: {
      findFirst: (...args: unknown[]) => mockFindFirstMembership(...args),
    },
    procedure: {
      findFirst: (...args: unknown[]) => mockFindFirstProcedure(...args),
    },
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    storage: {
      from: () => ({
        download: (...args: unknown[]) => mockDownload(...args),
      }),
    },
  },
}));

import { GET } from "@/app/api/procedure-images/route";

describe("GET /api/procedure-images", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET(
      new Request(
        "http://localhost/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fabc.png",
      ),
    );

    expect(response.status).toBe(401);
  });

  it("returns 403 when org prefix does not match user org", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirstMembership.mockResolvedValue({ orgId: "org-2" });

    const response = await GET(
      new Request(
        "http://localhost/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fabc.png",
      ),
    );

    expect(response.status).toBe(403);
  });

  it("streams image bytes for authorized org path", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirstMembership.mockResolvedValue({ orgId: "org-1" });
    mockFindFirstProcedure.mockResolvedValue({ id: "proc-1" });
    mockDownload.mockResolvedValue({
      data: new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }),
      error: null,
    });

    const response = await GET(
      new Request(
        "http://localhost/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fabc.png",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    const buffer = await response.arrayBuffer();
    expect(new Uint8Array(buffer)).toEqual(new Uint8Array([1, 2, 3]));
  });
});
