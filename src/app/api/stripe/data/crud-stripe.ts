import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Stripe } from "stripe";

export const updateStripeSubscription = async (
  subscription: Stripe.Subscription
) => {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const priceId = subscription.items.data[0]?.price.id;
  let plan: string | null = null;

  if(priceId){
    try {
      const price = await stripe.prices.retrieve(priceId, {
        expand: ["product"],
      });

      const product = price.product as Stripe.Product;
      plan = product.metadata?.plan || null;
    } catch (error) {
      console.error("Error retrieving price:", error);
    }
  }

  await prisma.organization.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
        ...(plan && {plan}),
    },
  });
};

export const deleteStripeSubscription = async (
  subscription: Stripe.Subscription
) => {
  await prisma.organization.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      currentPeriodEnd: null,
    },
  });
};
