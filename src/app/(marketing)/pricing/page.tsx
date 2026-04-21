import type { Metadata } from "next";
import Link from "next/link";

import {
  pricingPlans,
  subscriptionSignInHref,
} from "@/app/(marketing)/_content/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Navis Docs plans and sign-in flow for subscription checkout — placeholder tiers until final Stripe mapping.",
  openGraph: {
    title: "Pricing | Navis Docs",
    description:
      "Navis Docs plans and sign-in flow for subscription checkout — placeholder tiers until final Stripe mapping.",
  },
  twitter: {
    title: "Pricing | Navis Docs",
    description:
      "Navis Docs plans and sign-in flow for subscription checkout — placeholder tiers until final Stripe mapping.",
  },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground">
          TODO: Final tiers, prices, and comparison table. CTAs use the subscription
          callback pattern from the plan.
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-3">
        {pricingPlans.map((tier) => (
          <li
            key={tier.id}
            className="flex flex-col rounded-lg border p-6 shadow-sm"
          >
            <h2 className="font-serif text-xl font-semibold">{tier.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{tier.blurb}</p>
            <Link
              href={subscriptionSignInHref(tier.planSlug)}
              className="mt-6 inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground underline-offset-4 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Choose {tier.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
