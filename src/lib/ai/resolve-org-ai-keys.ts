import { decrypt } from "@/lib/crypto";
import { isSelfHosted } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";
import { OrgPlan, type StripeSubscriptionStatus } from "@prisma/client";

export type ResolvedOrgAiKeys = {
  /** Decrypted key; `undefined` in self-hosted (use env); `null` in cloud when unset */
  anthropicKey: string | null | undefined;
  /** Decrypted key; `undefined` in self-hosted (use env); `null` in cloud when unset */
  openAiKey: string | null | undefined;
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
 * Resolves per-org AI API keys for cloud deploys (decrypted). Self-hosted returns
 * empty resolution so callers use process env vars.
 */
export async function resolveOrgAiKeys(
  orgId: string,
): Promise<ResolvedOrgAiKeys & { cloudEntitled: boolean }> {
  if (isSelfHosted()) {
    return {
      anthropicKey: undefined,
      openAiKey: undefined,
      cloudEntitled: true,
    };
  }

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

  const cloudEntitled = isCloudAiEntitled(
    org.plan,
    org.stripeSubscriptionStatus,
  );

  return {
    cloudEntitled,
    anthropicKey: org.anthropicApiKey ? decrypt(org.anthropicApiKey) : null,
    openAiKey: org.openAiApiKey ? decrypt(org.openAiApiKey) : null,
  };
}
