"use server";
import { prisma } from "@/lib/prisma";

export const getStripeCustomerByOrg = async (orgSlug: string | null | undefined) => {
  if (!orgSlug) {
    return null;
  }

  return await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
      plan: true,
      currentPeriodEnd: true,
    },
  });
};