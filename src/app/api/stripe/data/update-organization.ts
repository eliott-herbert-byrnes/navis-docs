import { prisma } from "@/lib/prisma";
import { Stripe } from "stripe";

export const updateStripeSubscription = async (subscription: Stripe.Subscription) => {
    await prisma.organization.update({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeSubscriptionStatus: subscription.status,
          currentPeriodEnd: (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000)
            : null,
        },
  });
};