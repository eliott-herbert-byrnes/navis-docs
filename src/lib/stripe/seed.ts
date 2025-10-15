import { prisma } from "../prisma";
import { stripe } from "./";

const ORG_SLUG = process.env.SEED_ORG_SLUG ?? "demo-orginization";

const seed = async () => {
  const t0 = performance.now();
  console.log("Stripe Seed: Started ...");

  // clean up

  // 1) Fetch products and capture default price IDs
  const products = await stripe.products.list({ limit: 100 });
  const defaultPriceIds = new Set(
    products.data
      .map((p) =>
        typeof p.default_price === "string"
          ? p.default_price
          : p.default_price?.id
      )
      .filter(Boolean) as string[]
  );

  // 2) Archive products first (this alone usually suffices)
  for (const product of products.data) {
    if (product.active) {
      await stripe.products.update(product.id, { active: false });
    }
  }

  // 3) Archive non-default prices only
  for await (const price of stripe.prices.list({ limit: 100 })) {
    if (!defaultPriceIds.has(price.id) && price.active) {
      await stripe.prices.update(price.id, { active: false });
    }
  }

  // 4) Delete customers (auto-paginate)
  for await (const customer of stripe.customers.list({ limit: 100 })) {
    try {
      await stripe.customers.del(customer.id);
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

  const testClock = await stripe.testHelpers.testClocks.create({
    frozen_time: Math.round(new Date().getTime() / 1000),
  });

  const customer = await stripe.customers.create({
    email: org.ownerUser.email,
    name: org.name,
    metadata: { orgId: org.id, orgSlug: org.slug, plan: org.plan },
    test_clock: testClock.id,
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { stripeCustomerId: customer.id },
  });

  const productOne = await stripe.products.create({
    name: "Navis-docs Business Plan",
    description: "Your business plan.",
    marketing_features: [
      { name: "Up to 100 processes" },
      { name: "Up to 3 departments" },
      { name: "Up to 1 team per department" },
      { name: "AI-assisted drafting" },
      { name: "Email support" },
    ],
    metadata: { plan: "business" },
  });

  const productTwo = await stripe.products.create({
    name: "Navis-docs Enterprise Plan",
    description: "Your Enterprise plan.",
    marketing_features: [
      { name: "Up to 1000 processes" },
      { name: "Unlimited departments" },
      { name: "Unlimited teams per department" },
      { name: "AI-assisted drafting" },
      { name: "Priority support" },
    ],
    metadata: { plan: "enterprise" },
  });

  const businessPrice = await stripe.prices.create({
    product: productOne.id,
    unit_amount: 4999,
    currency: "usd",
    recurring: {
      interval: "month",
    },
    metadata: { plan: "business", allowedProcesses: 100, allowedDepartments: 3, allowedTeamsPerDepartment: 1 },
  });

  const enterprisePrice = await stripe.prices.create({
    product: productTwo.id,
    unit_amount: 29999,
    currency: "usd",
    recurring: {
      interval: "month",
    },
    metadata: { plan: "enterprise", allowedProcesses: 1000, allowedDepartments: 1000, allowedTeamsPerDepartment: 1000 },
  });

  const attachedPm = await stripe.paymentMethods.attach("pm_card_visa", {
    customer: customer.id,
  });
  
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: attachedPm.id },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: businessPrice.id }],
    automatic_tax: {
      enabled: false,
    },
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : null,
      plan: "business",
    },
  });

  const t1 = performance.now();
  console.log(`Stripe Seed: Finished (${t1 - t0}ms)`);
};

seed();
