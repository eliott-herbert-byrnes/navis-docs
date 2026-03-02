import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockFindFirstMembership = vi.fn();
const mockFindFirstProcedure = vi.fn();
const mockUpload = vi.fn();

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
        upload: (...args: unknown[]) => mockUpload(...args),
      }),
    },
  },
}));

import { POST } from "@/app/api/procedures/[procedureId]/images/route";

describe("POST /api/procedures/[procedureId]/images", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when user is not org admin/owner", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirstMembership.mockResolvedValue({
      orgId: "org-1",
      role: "MEMBER",
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["img"], "image.png", { type: "image/png" }),
    );
    const req = new Request("http://localhost/api/procedures/proc-1/images", {
      method: "POST",
      body: formData,
    });

    const response = await POST(req, {
      params: Promise.resolve({ procedureId: "proc-1" }),
    });

    expect(response.status).toBe(403);
    expect(mockFindFirstProcedure).not.toHaveBeenCalled();
  });

  it("uploads image and returns path + proxy src for admin", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindFirstMembership.mockResolvedValue({
      orgId: "org-1",
      role: "ADMIN",
    });
    mockFindFirstProcedure.mockResolvedValue({ id: "proc-1" });
    mockUpload.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["img"], "image.png", { type: "image/png" }),
    );
    const req = new Request("http://localhost/api/procedures/proc-1/images", {
      method: "POST",
      body: formData,
    });

    const response = await POST(req, {
      params: Promise.resolve({ procedureId: "proc-1" }),
    });

    expect(response.status).toBe(201);
    const json = (await response.json()) as { path: string; src: string };
    expect(json.path).toMatch(/^orgs\/org-1\/procedures\/proc-1\//);
    expect(json.src).toContain("/api/procedure-images?path=");
    expect(mockUpload).toHaveBeenCalledOnce();
  });
});
