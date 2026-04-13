import "dotenv/config";
import { OrgPlan } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../prisma";
import { getStripe } from "../stripe";

function parseArgs(): { slug: string | undefined } {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug" && args[i + 1]) {
      slug = args[++i];
    }
  }
  return { slug };
}

async function cancelStripeSubscriptionIfNeeded(
  stripeSubscriptionId: string,
): Promise<void> {
  const stripe = getStripe();
  let sub: Stripe.Subscription;
  try {
    sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  } catch (e) {
    if (
      e instanceof Stripe.errors.StripeInvalidRequestError &&
      e.code === "resource_missing"
    ) {
      console.warn(
        `Stripe subscription ${stripeSubscriptionId} not found; continuing with DB cleanup.`,
      );
      return;
    }
    throw e;
  }
  if (sub.status === "canceled") {
    console.log(
      `Stripe subscription ${stripeSubscriptionId} is already canceled; skipping cancel.`,
    );
    return;
  }
  await stripe.subscriptions.cancel(stripeSubscriptionId);
  console.log(
    `Canceled Stripe subscription ${stripeSubscriptionId} (immediate).`,
  );
}

async function main() {
  const { slug } = parseArgs();
  if (!slug) {
    console.error(
      "Usage: npx tsx src/lib/scripts/provision-enterprise.ts --slug <org-slug>",
    );
    process.exit(1);
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      stripeSubscriptionId: true,
    },
  });

  if (!org) {
    console.error(`Organization not found for slug: ${slug}`);
    process.exit(1);
  }

  if (org.stripeSubscriptionId) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error(
        "STRIPE_SECRET_KEY is required to cancel an existing Stripe subscription.",
      );
      process.exit(1);
    }
    await cancelStripeSubscriptionIfNeeded(org.stripeSubscriptionId);
  }

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      plan: OrgPlan.enterprise,
      entitlementsJSON: {},
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      currentPeriodEnd: null,
    },
  });

  console.log(
    `Enterprise provisioned: "${org.name}" (${org.slug}). Plan=enterprise, entitlementsJSON={}, Stripe fields cleared.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
