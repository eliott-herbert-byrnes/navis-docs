import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrgPlan, StripeSubscriptionStatus } from "@prisma/client";
import {
  BILLING_GRACE_DAYS,
  resolveOrgWriteAccess,
} from "@/lib/billing/access";

vi.mock("@/lib/deploy-mode", () => ({
  isSelfHosted: vi.fn(() => false),
}));

import { isSelfHosted } from "@/lib/deploy-mode";

const baseOrg = {
  plan: OrgPlan.pro,
  stripeSubscriptionStatus: null as StripeSubscriptionStatus | null,
  billingGraceEndsAt: null as Date | null,
};

describe("resolveOrgWriteAccess", () => {
  beforeEach(() => {
    vi.mocked(isSelfHosted).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("grants full write access on self-hosted deploy", () => {
    vi.mocked(isSelfHosted).mockReturnValue(true);

    const access = resolveOrgWriteAccess({
      ...baseOrg,
      plan: OrgPlan.free,
      stripeSubscriptionStatus: null,
    });

    expect(access).toEqual({
      hasWriteAccess: true,
      accessLevel: "full",
      graceEndsAt: null,
    });
  });

  it("grants full write access for enterprise plan", () => {
    const access = resolveOrgWriteAccess({
      ...baseOrg,
      plan: OrgPlan.enterprise,
      stripeSubscriptionStatus: null,
    });

    expect(access).toEqual({
      hasWriteAccess: true,
      accessLevel: "full",
      graceEndsAt: null,
    });
  });

  it("grants full write access for active subscription", () => {
    const access = resolveOrgWriteAccess({
      ...baseOrg,
      stripeSubscriptionStatus: StripeSubscriptionStatus.active,
    });

    expect(access).toEqual({
      hasWriteAccess: true,
      accessLevel: "full",
      graceEndsAt: null,
    });
  });

  it("grants full write access for trialing subscription", () => {
    const access = resolveOrgWriteAccess({
      ...baseOrg,
      stripeSubscriptionStatus: StripeSubscriptionStatus.trialing,
    });

    expect(access).toEqual({
      hasWriteAccess: true,
      accessLevel: "full",
      graceEndsAt: null,
    });
  });

  it("grants grace write access for past_due within billing grace window", () => {
    const now = new Date("2026-05-25T12:00:00.000Z");
    const graceEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const access = resolveOrgWriteAccess(
      {
        ...baseOrg,
        stripeSubscriptionStatus: StripeSubscriptionStatus.past_due,
        billingGraceEndsAt: graceEndsAt,
      },
      now,
    );

    expect(access).toEqual({
      hasWriteAccess: true,
      accessLevel: "grace",
      graceEndsAt,
    });
  });

  it("blocks writes when past_due grace has expired", () => {
    const now = new Date("2026-05-25T12:00:00.000Z");
    const graceEndsAt = new Date(now.getTime() - 1);

    const access = resolveOrgWriteAccess(
      {
        ...baseOrg,
        stripeSubscriptionStatus: StripeSubscriptionStatus.past_due,
        billingGraceEndsAt: graceEndsAt,
      },
      now,
    );

    expect(access).toEqual({
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt,
    });
  });

  it("blocks writes when past_due has no grace end date", () => {
    const access = resolveOrgWriteAccess({
      ...baseOrg,
      stripeSubscriptionStatus: StripeSubscriptionStatus.past_due,
      billingGraceEndsAt: null,
    });

    expect(access).toEqual({
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt: null,
    });
  });

  it("blocks writes when grace expires exactly at now", () => {
    const now = new Date("2026-05-25T12:00:00.000Z");

    const access = resolveOrgWriteAccess(
      {
        ...baseOrg,
        stripeSubscriptionStatus: StripeSubscriptionStatus.past_due,
        billingGraceEndsAt: now,
      },
      now,
    );

    expect(access).toEqual({
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt: now,
    });
  });

  it("blocks writes for free plan", () => {
    const access = resolveOrgWriteAccess({
      ...baseOrg,
      plan: OrgPlan.free,
      stripeSubscriptionStatus: null,
    });

    expect(access).toEqual({
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt: null,
    });
  });

  it("blocks writes when subscription is canceled", () => {
    const access = resolveOrgWriteAccess({
      ...baseOrg,
      stripeSubscriptionStatus: StripeSubscriptionStatus.canceled,
    });

    expect(access).toEqual({
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt: null,
    });
  });

  it("blocks writes when subscription is unpaid", () => {
    const access = resolveOrgWriteAccess({
      ...baseOrg,
      stripeSubscriptionStatus: StripeSubscriptionStatus.unpaid,
    });

    expect(access).toEqual({
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt: null,
    });
  });

  it("exports a 7-day billing grace constant for webhooks", () => {
    expect(BILLING_GRACE_DAYS).toBe(7);
  });
});
