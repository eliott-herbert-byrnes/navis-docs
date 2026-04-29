"use server";
import { dashboardPath, signInPath } from "@/app/paths";
import { toActionState } from "@/components/form/utils/to-action-state";
import { getSessionUser } from "@/lib/auth";
import { isSelfHosted } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { OrgMembershipRole, OrgPlan, StripeSubscriptionStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export const createCheckoutSession = async (
  orgSlug: string | null | undefined,
  priceId: string,
) => {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath());
  }

  if (isSelfHosted()) {
    return toActionState(
      "ERROR",
      "Checkout is not available for self-hosted deployments.",
    );
  }

  if (!orgSlug) {
    return toActionState("ERROR", "Organization is required");
  }

  const org = await prisma.organization.findUnique({
    where: {
      slug: orgSlug,
    },
  });
  if (!org) {
    return toActionState("ERROR", "Organization not found");
  }

  if (org.plan === OrgPlan.enterprise) {
    return toActionState(
      "ERROR",
      "Enterprise is provisioned manually. Contact us to change your plan.",
    );
  }

  const status = org.stripeSubscriptionStatus;
  if (
    status === StripeSubscriptionStatus.active ||
    status === StripeSubscriptionStatus.trialing
  ) {
    return toActionState(
      "ERROR",
      "This organization already has an active subscription.",
    );
  }

  const membership = await prisma.orgMembership.findFirst({
    where: {
      orgId: org.id,
      userId: user.userId,
      role: { in: [OrgMembershipRole.ADMIN, OrgMembershipRole.OWNER] },
    },
  });

  if (!membership) redirect(dashboardPath());

  const seatCount = Math.max(
    1,
    await prisma.orgMembership.count({ where: { orgId: org.id } }),
  );

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

  const priorSubs = await getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });
  const eligibleForTrial = priorSubs.data.length === 0;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: seatCount }],
    payment_method_collection: "if_required",
    allow_promotion_codes: true,
    success_url: `${baseUrl}/subscription?status=success`,
    cancel_url: `${baseUrl}/subscription?status=canceled`,
    metadata: { orgId: org.id, orgSlug: org.slug, plan: org.plan },
    ...(eligibleForTrial
      ? { subscription_data: { trial_period_days: 14 } }
      : {}),
  });

  if (!session.url) {
    return toActionState("ERROR", "Stripe session URL could not be created");
  }

  redirect(session.url);
};
