import { decrypt } from "@/lib/crypto";
import { isSelfHosted } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";
import { OrgPlan, type StripeSubscriptionStatus } from "@prisma/client";

export type ResolvedOrgAiKeys = {
  /** Decrypted key from DB, or `null` when not stored */
  anthropicKey: string | null;
  /** Decrypted key from DB, or `null` when not stored */
  openAiKey: string | null;
};

function isCloudAiEntitled(
  plan: OrgPlan,
  stripeSubscriptionStatus: StripeSubscriptionStatus | null,
): boolean {
  if (plan === OrgPlan.enterprise) return true;
  if (plan === OrgPlan.pro) {
    return (
      stripeSubscriptionStatus === "active" ||
      stripeSubscriptionStatus === "trialing"
    );
  }
  return false;
}

/**
 * Resolves per-org encrypted AI API keys from the database (decrypted).
 * Cloud deploys also require an active subscription tier (`cloudEntitled`).
 * Self-hosted deploys are always entitled; callers may still fall back to env
 * vars when no org key is stored (see `getAnthropic` / `getOpenAI`).
 */
export async function resolveOrgAiKeys(
  orgId: string,
): Promise<ResolvedOrgAiKeys & { cloudEntitled: boolean }> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      plan: true,
      stripeSubscriptionStatus: true,
      anthropicApiKey: true,
      openAiApiKey: true,
    },
  });

  if (!org) {
    return {
      anthropicKey: null,
      openAiKey: null,
      cloudEntitled: false,
    };
  }

  const anthropicKey = org.anthropicApiKey ? decrypt(org.anthropicApiKey) : null;
  const openAiKey = org.openAiApiKey ? decrypt(org.openAiApiKey) : null;

  if (isSelfHosted()) {
    return {
      anthropicKey,
      openAiKey,
      cloudEntitled: true,
    };
  }

  const cloudEntitled = isCloudAiEntitled(
    org.plan,
    org.stripeSubscriptionStatus,
  );

  return {
    cloudEntitled,
    anthropicKey,
    openAiKey,
  };
}
