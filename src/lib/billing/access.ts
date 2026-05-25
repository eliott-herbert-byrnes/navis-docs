import { isSelfHosted } from "@/lib/deploy-mode";
import { OrgPlan, StripeSubscriptionStatus } from "@prisma/client";

export const BILLING_GRACE_DAYS = 7;

export type OrgAccessLevel = "full" | "grace" | "read_only";

export type OrgAccess = {
  /** Whether the org may perform write operations (replaces legacy hasActiveAccess semantics). */
  hasWriteAccess: boolean;
  accessLevel: OrgAccessLevel;
  graceEndsAt: Date | null;
};

export function resolveOrgWriteAccess(
  org: {
    plan: OrgPlan;
    stripeSubscriptionStatus: StripeSubscriptionStatus | null;
    billingGraceEndsAt: Date | null;
  },
  now: Date = new Date(),
): OrgAccess {
  if (isSelfHosted()) {
    return {
      hasWriteAccess: true,
      accessLevel: "full",
      graceEndsAt: null,
    };
  }

  if (org.plan === OrgPlan.enterprise) {
    return {
      hasWriteAccess: true,
      accessLevel: "full",
      graceEndsAt: null,
    };
  }

  if (org.plan === OrgPlan.free) {
    return {
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt: null,
    };
  }

  const status = org.stripeSubscriptionStatus;

  if (
    status === StripeSubscriptionStatus.active ||
    status === StripeSubscriptionStatus.trialing
  ) {
    return {
      hasWriteAccess: true,
      accessLevel: "full",
      graceEndsAt: null,
    };
  }

  if (status === StripeSubscriptionStatus.past_due) {
    const graceEndsAt = org.billingGraceEndsAt;
    if (graceEndsAt && graceEndsAt > now) {
      return {
        hasWriteAccess: true,
        accessLevel: "grace",
        graceEndsAt,
      };
    }

    return {
      hasWriteAccess: false,
      accessLevel: "read_only",
      graceEndsAt: graceEndsAt ?? null,
    };
  }

  return {
    hasWriteAccess: false,
    accessLevel: "read_only",
    graceEndsAt: null,
  };
}
