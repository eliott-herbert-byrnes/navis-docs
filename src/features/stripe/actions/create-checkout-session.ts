"use server";
import { homePath, signInPath } from "@/app/paths";
import { toActionState } from "@/components/form/utils/to-action-state";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { OrgMembershipRole } from "@prisma/client";
import { redirect } from "next/navigation";

export const createCheckoutSession = async (
  orgSlug: string | null | undefined,
  priceId: string
) => {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath());
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

  const membership = await prisma.orgMembership.findFirst({
    where: {
      orgId: org.id,
      userId: user.userId,
      role: { in: [OrgMembershipRole.ADMIN, OrgMembershipRole.OWNER] },
    },
  });

  if (!membership) redirect(homePath());

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/subscription?status=success`,
    cancel_url: `${baseUrl}/subscription?status=canceled`,
    metadata: { orgId: org.id, orgSlug: org.slug, plan: org.plan },
  });

  if (!session.url) {
    return toActionState("ERROR", "Stripe session URL could not be created");
  }

  redirect(session.url);
};
