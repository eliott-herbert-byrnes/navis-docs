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
      const rawPlan = product.metadata?.plan;
      plan = rawPlan ? rawPlan.toLowerCase() : null;
    } catch (error) {
      console.error("Error retrieving price:", error);
    }
  }

  let entitlementsJSON = {};
  if (priceId) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (price.metadata){
        const {
          allowedProcesses,
          allowedDepartments,
          allowedTeamsPerDepartment
        } = price.metadata;

        if (allowedProcesses || allowedDepartments || allowedTeamsPerDepartment){
          entitlementsJSON = {
            allowedProcesses: allowedProcesses ? Number(allowedProcesses) : undefined,
            allowedDepartments: allowedDepartments ? Number(allowedDepartments) : undefined,
            allowedTeamsPerDepartment: allowedTeamsPerDepartment ? Number(allowedTeamsPerDepartment) : undefined,
          };
        }
      }
    } catch (error) {
      console.error("Error retrieving price metadata:", error);
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
        ...(Object.keys(entitlementsJSON).length > 0 && {entitlementsJSON}),
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
