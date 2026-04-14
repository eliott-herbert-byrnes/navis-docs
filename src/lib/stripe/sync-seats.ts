import { prisma } from "@/lib/prisma";
import { isSelfHosted } from "@/lib/deploy-mode";
import { getStripe } from "@/lib/stripe";
import { StripeSubscriptionStatus } from "@prisma/client";

/**
 * Sets the first Stripe subscription line item quantity to the current org
 * membership count (minimum 1). No-op for self-hosted or when there is no
 * active/trialing subscription. Throws on Stripe API errors.
 */
export async function syncStripeSeats(orgId: string): Promise<void> {
  if (isSelfHosted()) {
    return;
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
    },
  });

  if (!org?.stripeSubscriptionId) {
    return;
  }

  const status = org.stripeSubscriptionStatus;
  if (
    status !== StripeSubscriptionStatus.active &&
    status !== StripeSubscriptionStatus.trialing
  ) {
    return;
  }

  const seatCount = Math.max(
    1,
    await prisma.orgMembership.count({ where: { orgId } }),
  );

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    org.stripeSubscriptionId,
  );

  const firstItem = subscription.items.data[0];
  if (!firstItem) {
    throw new Error("Stripe subscription has no line items");
  }

  await stripe.subscriptionItems.update(firstItem.id, {
    quantity: seatCount,
  });
}
