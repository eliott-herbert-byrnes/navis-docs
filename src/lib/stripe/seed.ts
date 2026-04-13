import "dotenv/config";
import { OrgPlan } from "@prisma/client";
import { prisma } from "../prisma";
import { getStripe } from "./index";

const ORG_SLUG = process.env.SEED_ORG_SLUG ?? "demo-organization";

const seed = async () => {
  const t0 = performance.now();
  console.log("Stripe Seed: Started ...");

  // clean up database stripe references first
  console.log("Cleaning up database Stripe references...");
  await prisma.organization.updateMany({
    data: {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      currentPeriodEnd: null,
    },
  });

  // clean up stripe

  // 1) Fetch products and capture default price IDs
  const products = await getStripe().products.list({ limit: 100 });
  const defaultPriceIds = new Set(
    products.data
      .map((p) =>
        typeof p.default_price === "string"
          ? p.default_price
          : p.default_price?.id,
      )
      .filter(Boolean) as string[],
  );

  // 2) Archive products first (this alone usually suffices)
  for (const product of products.data) {
    if (product.active) {
      await getStripe().products.update(product.id, { active: false });
    }
  }

  // 3) Archive non-default prices only
  for await (const price of getStripe().prices.list({ limit: 100 })) {
    if (!defaultPriceIds.has(price.id) && price.active) {
      await getStripe().prices.update(price.id, { active: false });
    }
  }

  // 4) Cancel all active subscriptions first
  for await (const subscription of getStripe().subscriptions.list({
    limit: 100,
    status: "all",
  })) {
    try {
      if (
        subscription.status === "active" ||
        subscription.status === "trialing"
      ) {
        await getStripe().subscriptions.cancel(subscription.id);
        console.log(`Cancelled subscription ${subscription.id}`);
      }
    } catch (e) {
      console.warn(`Could not cancel subscription ${subscription.id}`, e);
    }
  }

  // 5) Delete customers (auto-paginate)
  for await (const customer of getStripe().customers.list({ limit: 100 })) {
    try {
      await getStripe().customers.del(customer.id);
      console.log(`Deleted customer ${customer.id}`);
    } catch (e) {
      console.warn(`Could not delete customer ${customer.id}`, e);
    }
  }

  // seed

  const org = await prisma.organization.findUniqueOrThrow({
    where: { slug: ORG_SLUG },
    include: {
      ownerUser: true,
    },
  });

  const seatCount = await prisma.orgMembership.count({
    where: { orgId: org.id },
  });
  const quantity = Math.max(1, seatCount);

  const testClock = await getStripe().testHelpers.testClocks.create({
    frozen_time: Math.round(new Date().getTime() / 1000),
  });

  const customer = await getStripe().customers.create({
    email: org.ownerUser.email,
    name: org.name,
    metadata: { orgId: org.id, orgSlug: org.slug, plan: org.plan },
    test_clock: testClock.id,
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { stripeCustomerId: customer.id },
  });

  const product = await getStripe().products.create({
    name: "Navis Docs Pro",
    description: "Per-seat Pro subscription for Navis Docs (cloud).",
    marketing_features: [
      { name: "Unlimited procedures, departments, and teams" },
      { name: "AI assistant" },
      { name: "14-day trial" },
    ],
    metadata: { plan: "pro" },
  });

  const monthlyPrice = await getStripe().prices.create({
    product: product.id,
    unit_amount: 1000,
    currency: "usd",
    recurring: {
      interval: "month",
      usage_type: "licensed",
    },
    metadata: {
      plan: "pro",
      billing: "monthly",
    },
  });

  const annualPrice = await getStripe().prices.create({
    product: product.id,
    unit_amount: 9600,
    currency: "usd",
    recurring: {
      interval: "year",
      usage_type: "licensed",
    },
    metadata: {
      plan: "pro",
      billing: "annual",
    },
  });

  const attachedPm = await getStripe().paymentMethods.attach("pm_card_visa", {
    customer: customer.id,
  });

  await getStripe().customers.update(customer.id, {
    invoice_settings: { default_payment_method: attachedPm.id },
  });

  const subscription = await getStripe().subscriptions.create({
    customer: customer.id,
    items: [{ price: monthlyPrice.id, quantity }],
    automatic_tax: {
      enabled: false,
    },
  });

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end
    ? new Date(subscription.items.data[0]?.current_period_end * 1000)
    : null;

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      currentPeriodEnd: currentPeriodEnd,
      plan: OrgPlan.pro,
    },
  });

  const t1 = performance.now();
  console.log(`\n✅ Stripe Seed: Finished (${Math.round(t1 - t0)}ms)`);
  console.log(`   - Product: Navis Docs Pro (${product.id})`);
  console.log(
    `   - Prices: monthly $10/seat (${monthlyPrice.id}), annual $96/seat (${annualPrice.id})`,
  );
  console.log(`   - Created customer: ${customer.email}`);
  console.log(
    `   - Created subscription: ${subscription.id} (${subscription.status}), qty=${quantity}`,
  );
  console.log(`   - Organization updated with Stripe IDs\n`);
};

seed();
