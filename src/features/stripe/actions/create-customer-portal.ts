"use server";
import { dashboardPath, signInPath, subscriptionPath } from "@/app/paths";
import { getSessionContext } from "@/lib/auth";
import { isSelfHosted } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { Stripe } from "stripe";

async function getOrCreateBillingPortalConfigurationId(
  baseUrl: string,
): Promise<string> {
  const list = await getStripe().billingPortal.configurations.list({
    limit: 100,
  });
  const existing = list.data.find((c) => c.active);
  if (existing) return existing.id;

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

  type PortalSubscriptionUpdate =
    Stripe.BillingPortal.ConfigurationCreateParams.Features.SubscriptionUpdate;

  const subscriptionUpdate: PortalSubscriptionUpdate =
    productsWithPrices.length > 0
      ? {
          default_allowed_updates: ["price"],
          enabled: true,
          proration_behavior: "create_prorations",
          products: productsWithPrices.map(({ product, prices }) => ({
            product: product.id,
            prices: prices.map((price) => price.id),
          })),
        }
      : { enabled: false };

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
      subscription_update: subscriptionUpdate,
    },
  });

  return configuration.id;
}

export const createCustomerPortal = async () => {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect(signInPath());
  }

  if (isSelfHosted() || !isStripeConfigured()) {
    redirect(subscriptionPath());
  }

  const { org, isAdmin } = ctx;
  if (!isAdmin) {
    redirect(dashboardPath());
  }
  if (!org) {
    redirect(dashboardPath());
  }

  if (!org.stripeSubscriptionId) {
    redirect(subscriptionPath());
  }

  const createFreshCustomer = async () => {
    const customer = await getStripe().customers.create({
      email: undefined,
      name: org.name,
      metadata: { orgId: org.id, orgSlug: org.slug, plan: org.plan },
    });
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customer.id },
    });
    return customer.id;
  };

  let customerId = org.stripeCustomerId ?? (await createFreshCustomer());

  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const hasScheme = !!rawAppUrl && /^(http|https):\/\//i.test(rawAppUrl);
  const baseUrl = rawAppUrl
    ? hasScheme
      ? rawAppUrl
      : `https://${rawAppUrl}`
    : "http://localhost:3000";

  const configurationId =
    await getOrCreateBillingPortalConfigurationId(baseUrl);

  let session: Stripe.BillingPortal.Session;
  try {
    session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/subscription`,
      configuration: configurationId,
    });
  } catch (err) {
    if (
      err instanceof Stripe.errors.StripeInvalidRequestError &&
      err.code === "resource_missing"
    ) {
      customerId = await createFreshCustomer();
      session = await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/subscription`,
        configuration: configurationId,
      });
    } else {
      throw err;
    }
  }

  if (!session.url) {
    redirect(dashboardPath());
  }

  redirect(session.url);
};
