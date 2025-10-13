import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function toDateFromStripe(ts?: number | null): Date | null {
    return typeof ts === "number" ? new Date(ts * 1000) : null;
  }

const PRICE_ID_TO_PLAN: Record<string, "business" | "enterprise"> = {
  [process.env.STRIPE_BUSINESS_PRICE_ID!]: "business",
  [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: "enterprise",
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") as string;
  const buffer = Buffer.from(await request.arrayBuffer());
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = s.subscription as string | null;
        const orgId = s.client_reference_id as string | null;
        if (subscriptionId && orgId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);

          const subscribedPriceId = sub.items.data[0]?.price?.id ?? "";
          const plan = PRICE_ID_TO_PLAN[subscribedPriceId] ?? "business";

          await prisma.organization.update({
            where: { id: orgId },
            data: {
              stripeSubscriptionId: sub.id,
              stripeSubscriptionStatus: sub.status,
              currentPeriodEnd: toDateFromStripe((sub as any).current_period_end ?? (sub as any).trial_end ?? null),
              plan,
              entitlementsJSON:
                plan === "enterprise"
                  ? {
                      maxProcesses: 1000,
                      maxDepartments: null,
                      maxTeamsPerDepartment: null,
                    }
                  : {
                      maxProcesses: 100,
                      maxDepartments: 3,
                      maxTeamsPerDepartment: 1,
                    },
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const org = await prisma.organization.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: sub.id },
              { stripeCustomerId: sub.customer?.toString() },
            ],
          },
        });
        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeSubscriptionId: sub.id,
              stripeSubscriptionStatus: sub.status,
              currentPeriodEnd: toDateFromStripe((sub as any).current_period_end ?? (sub as any).trial_end ?? null),
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return new NextResponse(`Webhook hanlder failed: ${error.message}`, {
      status: 500,
    });
  }
}
