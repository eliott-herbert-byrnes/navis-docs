import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "crypto";

const mockCreate = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailOTP: {
      create: (...args: unknown[]) => mockCreate(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

vi.mock("@/lib/redis", () => ({
  getRedis: vi.fn(() => ({
    set: vi.fn().mockResolvedValue("OK"),
  })),
}));

import { createOtpFor, verifyOtpAndConsume } from "@/lib/otp";

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

describe("createOtpFor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.E2E_TEST_MODE;
    mockCreate.mockResolvedValue({ id: "otp-1" });
  });

  it("stores a hashed 5-digit code for the email", async () => {
    const result = await createOtpFor("User@Example.com");

    expect(result.code).toMatch(/^\d{5}$/);
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "user@example.com",
        codeHash: hashCode(result.code),
        expiresAt: expect.any(Date),
      }),
    });
  });
});

describe("verifyOtpAndConsume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true and deletes OTP rows when the code matches", async () => {
    const code = "12345";
    mockFindFirst.mockResolvedValue({
      id: "otp-1",
      codeHash: hashCode(code),
      attempts: 0,
    });
    mockUpdate.mockResolvedValue({});
    mockDeleteMany.mockResolvedValue({ count: 1 });

    const ok = await verifyOtpAndConsume("user@example.com", code);

    expect(ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "otp-1" },
      data: { attempts: 1, consumedAt: expect.any(Date) },
    });
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        email: "user@example.com",
        codeHash: hashCode(code),
      },
    });
  });

  it("returns false when no active OTP exists", async () => {
    mockFindFirst.mockResolvedValue(null);

    const ok = await verifyOtpAndConsume("user@example.com", "12345");

    expect(ok).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns false when attempts are exhausted", async () => {
    mockFindFirst.mockResolvedValue({
      id: "otp-1",
      codeHash: hashCode("12345"),
      attempts: 5,
    });

    const ok = await verifyOtpAndConsume("user@example.com", "12345");

    expect(ok).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("increments attempts but does not delete when the code is wrong", async () => {
    mockFindFirst.mockResolvedValue({
      id: "otp-1",
      codeHash: hashCode("99999"),
      attempts: 1,
    });
    mockUpdate.mockResolvedValue({});

    const ok = await verifyOtpAndConsume("user@example.com", "12345");

    expect(ok).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "otp-1" },
      data: { attempts: 2, consumedAt: null },
    });
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });
});
