import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";

const mockIsSelfHosted = vi.fn();

vi.mock("@/lib/deploy-mode", () => ({
  isSelfHosted: (...args: unknown[]) => mockIsSelfHosted(...args),
  isCloud: vi.fn(),
}));

import {
  assertAiEnabled,
  AI_SELF_HOSTED_ONLY_USER,
  isAiEnabled,
} from "@/lib/ai/ai-enabled";

describe("isAiEnabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when self-hosted", () => {
    mockIsSelfHosted.mockReturnValue(true);
    expect(isAiEnabled()).toBe(true);
    expect(mockIsSelfHosted).toHaveBeenCalled();
  });

  it("returns false when cloud", () => {
    mockIsSelfHosted.mockReturnValue(false);
    expect(isAiEnabled()).toBe(false);
  });
});

describe("assertAiEnabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw when AI is enabled", () => {
    mockIsSelfHosted.mockReturnValue(true);
    expect(() => assertAiEnabled()).not.toThrow();
  });

  it("throws FORBIDDEN when AI is disabled", () => {
    mockIsSelfHosted.mockReturnValue(false);

    expect(() => assertAiEnabled()).toThrow(TRPCError);

    try {
      assertAiEnabled();
    } catch (error) {
      expect(error).toMatchObject({
        code: "FORBIDDEN",
        message: AI_SELF_HOSTED_ONLY_USER,
      });
    }
  });
});
