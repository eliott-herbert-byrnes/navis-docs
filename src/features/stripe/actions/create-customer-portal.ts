"use server";
import { homePath, signInPath } from "@/app/paths";
import { toActionState } from "@/components/form/utils/to-action-state";
import { getSessionContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { Stripe } from "stripe";

export const createCustomerPortal = async () => {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect(signInPath());
  }

  const { org, isAdmin } = ctx;
  if (!isAdmin) {
    redirect(homePath());
  }
  if (!org) {
    redirect(homePath());
  }

  let customerId = org.stripeCustomerId;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: undefined,
      name: org.name,
      metadata: { orgId: org.id, orgSlug: org.slug, plan: org.plan },
    });
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customer.id },
    });
    customerId = customer.id;
  }

  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const hasScheme = !!rawAppUrl && /^(http|https):\/\//i.test(rawAppUrl);
  const baseUrl = rawAppUrl
    ? hasScheme
      ? rawAppUrl
      : `https://${rawAppUrl}`
    : "http://localhost:3000";

  const productsWithPrices: Array<{
    product: Stripe.Product;
    prices: Stripe.Price[];
  }> = [];
  const products = await getStripe().products.list({ active: true });
  for (const product of products.data) {
    const prices = await getStripe().prices.list({
      active: true,
      product: product.id,
    });
    if (prices.data.length > 0) {
      productsWithPrices.push({ product, prices: prices.data });
    }
  }

  const configuration = await getStripe().billingPortal.configurations.create({
    business_profile: {
      privacy_policy_url: `${baseUrl}/privacy`,
      terms_of_service_url: `${baseUrl}/terms`,
    },
    features: {
      payment_method_update: { enabled: true },
      customer_update: {
        allowed_updates: ["name", "email", "address", "tax_id"],
        enabled: true,
      },
      invoice_history: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
      },
      subscription_update: {
        default_allowed_updates: ["price"],
        enabled: true,
        proration_behavior: "create_prorations",
        products:
          productsWithPrices.length > 0
            ? productsWithPrices.map(({ product, prices }) => ({
                product: product.id,
                prices: prices.map((price) => price.id),
              }))
            : undefined,
      },
    },
  });

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/subscription`,
    configuration: configuration.id,
  });

  if (!session.url) {
    redirect(homePath());
  }

  redirect(session.url);
};
