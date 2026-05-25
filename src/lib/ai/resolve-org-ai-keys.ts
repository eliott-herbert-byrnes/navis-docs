import { decrypt } from "@/lib/crypto";
import { resolveOrgWriteAccess } from "@/lib/billing/access";
import { isSelfHosted } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";

export type ResolvedOrgAiKeys = {
  /** Decrypted key from DB, or `null` when not stored */
  anthropicKey: string | null;
  /** Decrypted key from DB, or `null` when not stored */
  openAiKey: string | null;
};

/**
 * Resolves per-org encrypted AI API keys from the database (decrypted).
 * Cloud deploys also require write access (active, trialing, or past_due grace).
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
      billingGraceEndsAt: true,
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

  const anthropicKey = org.anthropicApiKey
    ? decrypt(org.anthropicApiKey)
    : null;
  const openAiKey = org.openAiApiKey ? decrypt(org.openAiApiKey) : null;

  if (isSelfHosted()) {
    return {
      anthropicKey,
      openAiKey,
      cloudEntitled: true,
    };
  }

  const cloudEntitled = resolveOrgWriteAccess(org).hasWriteAccess;

  return {
    cloudEntitled,
    anthropicKey,
    openAiKey,
  };
}
