import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { OrgPlan } from "@prisma/client";
import { Stripe } from "stripe";

/** Stripe product metadata may still use legacy `business` until products are re-seeded. */
function stripeMetadataPlanToOrgPlan(raw: string | null): OrgPlan | null {
  if (!raw) return null;
  const p = raw.toLowerCase();
  if (p === "enterprise") return OrgPlan.enterprise;
  if (p === "pro" || p === "business") return OrgPlan.pro;
  return null;
}

export const updateStripeSubscription = async (
  subscription: Stripe.Subscription,
) => {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const priceId = subscription.items.data[0]?.price.id;
  let plan: string | null = null;

  if (priceId) {
    try {
      const price = await getStripe().prices.retrieve(priceId, {
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
      const price = await getStripe().prices.retrieve(priceId);
      if (price.metadata) {
        const {
          allowedProcedures,
          allowedProcesses,
          allowedDepartments,
          allowedTeamsPerDepartment,
        } = price.metadata;

        const proceduresRaw = allowedProcedures ?? allowedProcesses;

        if (
          proceduresRaw ||
          allowedDepartments ||
          allowedTeamsPerDepartment
        ) {
          entitlementsJSON = {
            allowedProcedures: proceduresRaw
              ? Number(proceduresRaw)
              : undefined,
            allowedDepartments: allowedDepartments
              ? Number(allowedDepartments)
              : undefined,
            allowedTeamsPerDepartment: allowedTeamsPerDepartment
              ? Number(allowedTeamsPerDepartment)
              : undefined,
          };
        }
      }
    } catch (error) {
      console.error("Error retrieving price metadata:", error);
    }
  }

  const orgPlan = stripeMetadataPlanToOrgPlan(plan);

  await prisma.organization.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      ...(orgPlan ? { plan: orgPlan } : {}),
      ...(Object.keys(entitlementsJSON).length > 0 && { entitlementsJSON }),
    },
  });
};

export const deleteStripeSubscription = async (
  subscription: Stripe.Subscription,
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
