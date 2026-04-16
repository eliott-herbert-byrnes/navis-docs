import { SubscriptionEndedEmail } from "@/emails/subscription-ended";
import { TrialStartedEmail } from "@/emails/trial-started";
import { TrialWillEndEmail } from "@/emails/trial-will-end";
import { getResend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { OrgPlan, StripeSubscriptionStatus } from "@prisma/client";
import { render } from "@react-email/render";
import React from "react";
import { Stripe } from "stripe";

/** Webhook payloads include subscription/customer ids; SDK Invoice typing can lag the API. */
type InvoicePayload = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

function stripeCustomerIdFromInvoice(invoice: InvoicePayload): string | null {
  const c = invoice.customer;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "id" in c && typeof c.id === "string")
    return c.id;
  return null;
}

function subscriptionIdFromInvoice(invoice: InvoicePayload): string | null {
  const s = invoice.subscription;
  if (typeof s === "string") return s;
  if (s && typeof s === "object" && "id" in s) return s.id;
  return null;
}

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

function stripeCustomerIdFromSubscription(
  subscription: Stripe.Subscription,
): string | null {
  const c = subscription.customer;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "id" in c && typeof c.id === "string")
    return c.id;
  return null;
}

export const deleteStripeSubscription = async (
  subscription: Stripe.Subscription,
) => {
  const customerId = stripeCustomerIdFromSubscription(subscription);
  if (!customerId) return;

  const org = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
    include: { ownerUser: { select: { email: true, name: true } } },
  });

  await prisma.organization.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      currentPeriodEnd: null,
    },
  });

  if (org?.ownerUser?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const billingUrl = baseUrl ? `${baseUrl}/subscription` : "/subscription";
    await sendSubscriptionEndedEmail({
      to: org.ownerUser.email,
      ownerName: org.ownerUser.name ?? "there",
      orgName: org.name,
      billingUrl,
    });
  }
};

/** Subscription invoice payment failed — mark org as past_due. */
export async function handleInvoicePaymentFailed(
  invoice: InvoicePayload,
): Promise<void> {
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  const customerId = stripeCustomerIdFromInvoice(invoice);
  if (!subscriptionId || !customerId) return;

  await prisma.organization.update({
    where: { stripeCustomerId: customerId },
    data: { stripeSubscriptionStatus: StripeSubscriptionStatus.past_due },
  });
}

/** Paid invoice — re-sync subscription status (e.g. active after successful renewal). */
export async function handleInvoicePaid(invoice: InvoicePayload): Promise<void> {
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  await updateStripeSubscription(subscription);
}

/**
 * Trial ending soon — email org owner to add a payment method.
 * Does not throw; logs on failure so the webhook can still return 200.
 */
export async function sendTrialWillEndEmail(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = stripeCustomerIdFromSubscription(subscription);
  if (!customerId) return;

  const org = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
    include: {
      ownerUser: { select: { email: true, name: true } },
    },
  });
  if (!org?.ownerUser?.email) {
    console.warn(
      `trial_will_end: no org or owner email for customer ${customerId}`,
    );
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const billingUrl = baseUrl ? `${baseUrl}/subscription` : "/subscription";

  try {
    const resend = getResend();
    const html = await render(
      React.createElement(TrialWillEndEmail, {
        orgName: org.name,
        ownerName: org.ownerUser.name ?? "there",
        billingUrl,
      }),
    );
    await resend.emails.send({
      from: "Navis Docs <no-reply@app.navisdocs.com>",
      to: org.ownerUser.email,
      subject: "Your Navis Docs trial is ending soon",
      html,
    });
  } catch (err) {
    console.error("trial_will_end: failed to send email", err);
  }
}

export type SendTrialStartedEmailInput = {
  to: string;
  ownerName: string;
  orgName: string;
  trialEndsAt: Date;
  billingUrl: string;
};

/** Welcome email when a cloud org’s Stripe trial subscription is provisioned (e.g. on organization create). */
export async function sendTrialStartedEmail(
  input: SendTrialStartedEmailInput,
): Promise<void> {
  const resend = getResend();
  const html = await render(
    React.createElement(TrialStartedEmail, {
      orgName: input.orgName,
      ownerName: input.ownerName,
      trialEndsAt: input.trialEndsAt,
      billingUrl: input.billingUrl,
    }),
  );
  await resend.emails.send({
    from: "Navis Docs <no-reply@app.navisdocs.com>",
    to: input.to,
    subject: `Your Navis Docs trial has started for ${input.orgName}`,
    html,
  });
}

export type SendSubscriptionEndedEmailInput = {
  to: string;
  ownerName: string;
  orgName: string;
  billingUrl: string;
};

/**
 * Sent when Stripe removes a subscription (e.g. trial ended without payment).
 * Does not throw; logs on failure so the webhook can still return 200.
 */
export async function sendSubscriptionEndedEmail(
  input: SendSubscriptionEndedEmailInput,
): Promise<void> {
  try {
    const resend = getResend();
    const html = await render(
      React.createElement(SubscriptionEndedEmail, {
        orgName: input.orgName,
        ownerName: input.ownerName,
        billingUrl: input.billingUrl,
      }),
    );
    await resend.emails.send({
      from: "Navis Docs <no-reply@app.navisdocs.com>",
      to: input.to,
      subject: `Your Navis Docs access for ${input.orgName} has ended`,
      html,
    });
  } catch (err) {
    console.error(
      "customer.subscription.deleted: failed to send subscription ended email",
      err,
    );
  }
}
