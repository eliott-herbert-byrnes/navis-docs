import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLimiter = vi.fn();
const mockSignIn = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock("@/features/auth/lib/rate-limit", () => ({
  limiter: (...args: unknown[]) => mockLimiter(...args),
}));

vi.mock("@/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailOTP: {
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

import { verifyOtpAction } from "@/features/auth/actions/verify-otp";

describe("verifyOtpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimiter.mockResolvedValue({ success: true });
    mockSignIn.mockResolvedValue(undefined);
    mockDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("rejects invalid payloads", async () => {
    const result = await verifyOtpAction({ email: "bad", code: "12" });

    expect(result).toEqual({
      ok: false,
      message: "Invalid code, check your email and try again",
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("returns rate-limit message when limiter fails", async () => {
    mockLimiter.mockResolvedValue({ success: false });

    const result = await verifyOtpAction({
      email: "user@example.com",
      code: "12345",
    });

    expect(result).toEqual({
      ok: false,
      message: "Too many attempts, try again later",
    });
  });

  it("signs in and clears OTP rows on success", async () => {
    const result = await verifyOtpAction({
      email: " User@Example.com ",
      code: " 12345 ",
    });

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      code: "12345",
      redirect: false,
    });
    expect(mockDeleteMany).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it("returns auth error message when signIn reports an error", async () => {
    mockSignIn.mockResolvedValue({ error: "Invalid code" });

    const result = await verifyOtpAction({
      email: "user@example.com",
      code: "12345",
    });

    expect(result).toEqual({ ok: false, message: "Invalid code" });
  });

  it("returns generic failure when signIn throws", async () => {
    mockSignIn.mockRejectedValue(new Error("boom"));

    const result = await verifyOtpAction({
      email: "user@example.com",
      code: "12345",
    });

    expect(result).toEqual({
      ok: false,
      message: "Invalid code, check your email and try again",
    });
  });
});
