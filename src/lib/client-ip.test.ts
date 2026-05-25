import { describe, expect, it } from "vitest";
import { getClientIpFromHeaders } from "@/lib/client-ip";

function headers(init: Record<string, string>): Headers {
  return new Headers(init);
}

describe("getClientIpFromHeaders", () => {
  it("prefers Cloudflare cf-connecting-ip", () => {
    expect(
      getClientIpFromHeaders(
        headers({
          "cf-connecting-ip": "1.2.3.4",
          "x-forwarded-for": "9.9.9.9",
        }),
      ),
    ).toBe("1.2.3.4");
  });

  it("prefers x-vercel-forwarded-for on Vercel", () => {
    process.env.VERCEL = "1";
    try {
      expect(
        getClientIpFromHeaders(
          headers({
            "x-vercel-forwarded-for": "5.6.7.8",
            "x-forwarded-for": "9.9.9.9",
          }),
        ),
      ).toBe("5.6.7.8");
    } finally {
      delete process.env.VERCEL;
    }
  });

  it("does not trust x-forwarded-for without a trusted proxy", () => {
    delete process.env.VERCEL;
    delete process.env.TRUSTED_PROXY;
    delete process.env.AUTH_TRUST_HOST;

    expect(
      getClientIpFromHeaders(headers({ "x-forwarded-for": "9.9.9.9" })),
    ).toBe("unknown");
  });

  it("uses x-real-ip when TRUSTED_PROXY is set", () => {
    process.env.TRUSTED_PROXY = "true";
    try {
      expect(
        getClientIpFromHeaders(
          headers({
            "x-real-ip": "10.0.0.1",
            "x-forwarded-for": "9.9.9.9, 10.0.0.1",
          }),
        ),
      ).toBe("10.0.0.1");
    } finally {
      delete process.env.TRUSTED_PROXY;
    }
  });

  it("uses the rightmost x-forwarded-for hop behind a trusted proxy", () => {
    process.env.TRUSTED_PROXY = "true";
    try {
      expect(
        getClientIpFromHeaders(
          headers({ "x-forwarded-for": "9.9.9.9, 203.0.113.10" }),
        ),
      ).toBe("203.0.113.10");
    } finally {
      delete process.env.TRUSTED_PROXY;
    }
  });

  it("uses AUTH_TRUST_HOST as a trusted-proxy signal", () => {
    delete process.env.TRUSTED_PROXY;
    process.env.AUTH_TRUST_HOST = "true";
    try {
      expect(
        getClientIpFromHeaders(headers({ "x-real-ip": "192.168.1.5" })),
      ).toBe("192.168.1.5");
    } finally {
      delete process.env.AUTH_TRUST_HOST;
    }
  });
});
