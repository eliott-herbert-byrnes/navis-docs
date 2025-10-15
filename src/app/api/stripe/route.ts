import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import * as stripeData from "./data";

export const runtime = "nodejs";

const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  await stripeData.updateStripeSubscription(subscription);
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  await stripeData.updateStripeSubscription(subscription);
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  await stripeData.deleteStripeSubscription(subscription);
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret)
    return new NextResponse("Missing Webhook Secret", { status: 500 });
  if (!signature)
    return new NextResponse("Missing Stripe Signature", { status: 400 });

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }

    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse("Invalid Stripe Signature", { status: 400 });
  }
}
