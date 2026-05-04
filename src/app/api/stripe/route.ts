import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import * as stripeData from "./data";

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

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (err) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      return new NextResponse("Invalid Stripe Signature", { status: 400 });
    }
    console.error("Stripe webhook: signature verification failed unexpectedly", err);
    return new NextResponse("Webhook verification error", { status: 500 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.trial_will_end":
        await stripeData.sendTrialWillEndEmail(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "invoice.payment_failed":
        await stripeData.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;
      case "invoice.paid":
        await stripeData.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        if (process.env.NODE_ENV !== "production") {
          console.warn(`Unhandled event type ${event.type}.`);
        }
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Stripe webhook: handler error", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
