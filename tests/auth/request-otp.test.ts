import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLimiter = vi.fn();
const mockCreateOtpFor = vi.fn();
const mockGetResend = vi.fn();
const mockHeaders = vi.fn();

vi.mock("@/features/auth/lib/rate-limit", () => ({
  limiter: (...args: unknown[]) => mockLimiter(...args),
}));

vi.mock("@/lib/otp", () => ({
  createOtpFor: (...args: unknown[]) => mockCreateOtpFor(...args),
}));

vi.mock("@/lib/resend", () => ({
  getResend: () => mockGetResend(),
}));

vi.mock("@/lib/email", () => ({
  getEmailFrom: () => "test@example.com",
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<p>code</p>"),
}));

vi.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}));

import { requestOtpAction } from "@/features/auth/actions/request-otp";

describe("requestOtpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimiter.mockResolvedValue({ success: true });
    mockHeaders.mockResolvedValue({
      get: () => "127.0.0.1",
    });
    mockCreateOtpFor.mockResolvedValue({ code: "12345", expiresAt: new Date() });
    mockGetResend.mockReturnValue({
      emails: {
        send: vi.fn().mockResolvedValue({ error: null }),
      },
    });
  });

  it("rejects invalid email addresses", async () => {
    const result = await requestOtpAction("not-an-email");

    expect(result).toEqual({
      ok: false,
      message: "Invalid email, check the address and try again",
    });
    expect(mockCreateOtpFor).not.toHaveBeenCalled();
  });

  it("returns rate-limit message when limiter fails", async () => {
    mockLimiter.mockResolvedValue({ success: false });

    const result = await requestOtpAction("user@example.com");

    expect(result).toEqual({
      ok: false,
      message: "Too many requests, try again later",
    });
  });

  it("sends OTP email and returns success", async () => {
    const send = vi.fn().mockResolvedValue({ error: null });
    mockGetResend.mockReturnValue({ emails: { send } });

    const result = await requestOtpAction("  User@Example.com  ");

    expect(mockCreateOtpFor).toHaveBeenCalledWith("user@example.com");
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Your sign-in code",
      }),
    );
    expect(result).toEqual({
      ok: true,
      message: "Code sent. Check your email",
    });
  });

  it("returns a friendly error when Resend fails", async () => {
    mockGetResend.mockReturnValue({
      emails: {
        send: vi.fn().mockResolvedValue({ error: { message: "smtp down" } }),
      },
    });

    const result = await requestOtpAction("user@example.com");

    expect(result).toEqual({
      ok: false,
      message: "Could not send sign-in code, try again later",
    });
  });

  it("returns a friendly error when Resend throws", async () => {
    mockGetResend.mockImplementation(() => {
      throw new Error("network");
    });

    const result = await requestOtpAction("user@example.com");

    expect(result).toEqual({
      ok: false,
      message: "Could not send sign-in code, try again later",
    });
  });
});
