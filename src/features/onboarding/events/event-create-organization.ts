import { sendTrialStartedEmail } from "@/app/api/stripe/data/crud-stripe";
import { inngest } from "@/inngest/client";
import { isCloud } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { NonRetriableError } from "inngest";

export type EventCreateOrganization = {
  data: {
    orgId: string;
    orgSlug?: string;
    orgName?: string;
    orgOwnerUserId?: string;
  };
};

export const eventCreateOrganization = inngest.createFunction(
  {
    id: "create-organization",
    onFailure: async ({ error, event: failureEvent }) => {
      const original = failureEvent.data.event as
        | { data?: { orgId?: string } }
        | undefined;
      const orgId = original?.data?.orgId;
      console.error(
        "[create-organization] Inngest function failed after retries",
        {
          orgId,
          message: error.message,
          stack: error.stack,
        },
      );
    },
  },
  {
    event: "onboarding/create-organization",
  },
  async ({ event, step }) => {
    const { orgId } = event.data;

    if (!isCloud()) {
      return { event, body: true as const };
    }

    const priceId = process.env.STRIPE_DEFAULT_PRICE_ID;
    if (!priceId) {
      throw new NonRetriableError(
        "STRIPE_DEFAULT_PRICE_ID is not configured; cannot create trial subscription",
      );
    }

    const mailPayload = await step.run("provision-stripe-trial", async () => {
      const org = await prisma.organization.findUniqueOrThrow({
        where: { id: orgId },
        include: {
          ownerUser: true,
        },
      });

      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const customer = await getStripe().customers.create({
          email: org.ownerUser.email ?? undefined,
          name: org.name,
          metadata: { orgId: org.id, orgSlug: org.slug },
        });
        customerId = customer.id;
        await prisma.organization.update({
          where: { id: org.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const seatCount = Math.max(
        1,
        await prisma.orgMembership.count({ where: { orgId: org.id } }),
      );

      const existingSubs = await getStripe().subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 20,
      });
      let subscription = existingSubs.data.find(
        (s) =>
          s.metadata?.orgId === org.id &&
          (s.status === "trialing" || s.status === "active"),
      );

      if (!subscription) {
        subscription = await getStripe().subscriptions.create({
          customer: customerId,
          items: [{ price: priceId, quantity: seatCount }],
          trial_period_days: 14,
          payment_behavior: "default_incomplete",
          payment_settings: { save_default_payment_method: "on_subscription" },
          metadata: { orgId: org.id, orgSlug: org.slug },
        });
      }

      const trialEndSec = subscription.trial_end;
      const trialEndsAtIso = trialEndSec
        ? new Date(trialEndSec * 1000).toISOString()
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const billingUrl = baseUrl ? `${baseUrl}/subscription` : "/subscription";

      return {
        to: org.ownerUser.email,
        ownerName: org.ownerUser.name ?? "there",
        orgName: org.name,
        trialEndsAtIso,
        billingUrl,
      };
    });

    await step.run("send-trial-started-email", async () => {
      if (!mailPayload.to) {
        console.warn(
          "[create-organization] owner has no email; skipping welcome email",
          { orgId },
        );
        return;
      }
      await sendTrialStartedEmail({
        to: mailPayload.to,
        ownerName: mailPayload.ownerName,
        orgName: mailPayload.orgName,
        trialEndsAt: new Date(mailPayload.trialEndsAtIso),
        billingUrl: mailPayload.billingUrl,
      });
    });

    return { event, body: true };
  },
);
