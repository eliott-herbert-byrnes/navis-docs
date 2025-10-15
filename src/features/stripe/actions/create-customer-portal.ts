"use server";
import { homePath, signInPath } from "@/app/paths";
import { toActionState } from "@/components/form/utils/to-action-state";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export const createCustomerPortal = async (orgSlug: string) => {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath());
  }

  if (!orgSlug) {
    redirect(homePath());
  }

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) {
    redirect(homePath());
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });

  if (!org) {
    return toActionState("ERROR", "Organization not found");
  }

  // Ensure a Stripe customer exists
  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
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

  // Build a valid absolute return URL with scheme and fallback
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const hasScheme = !!rawAppUrl && /^(http|https):\/\//i.test(rawAppUrl);
  const baseUrl = rawAppUrl
    ? hasScheme
      ? rawAppUrl
      : `https://${rawAppUrl}`
    : "http://localhost:3000";

  // Optional: only create this once and store the ID; keeping it here is fine for now
  const productsWithPrices: Array<{ product: any; prices: any[] }> = [];
  const products = await stripe.products.list({ active: true });
  for (const product of products.data) {
    const prices = await stripe.prices.list({ active: true, product: product.id });
    productsWithPrices.push({ product, prices: prices.data });
  }

  const configuration = await stripe.billingPortal.configurations.create({
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
        products: productsWithPrices.map(({ product, prices }) => ({
          product: product.id,
          prices: prices.map((price) => price.id),
        })),
      },
    },
  });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/subscription`,
    configuration: configuration.id,
  });

  if (!session.url) {
    return toActionState("ERROR", "Session URL could not be created");
  }

  redirect(session.url);
};