import type { Metadata } from "next";

import { MarketingPricingTiers } from "@/app/(marketing)/_components/pricing-cards";
import {
  EnterprisePlanCard,
  SelfHostedPlanCard,
} from "@/features/stripe/components/product";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for teams of all sizes. Start with a 14-day free trial of Navis Docs Pro, self-host for free, or contact us for Enterprise.",
  openGraph: {
    title: "Pricing | Navis Docs",
    description:
      "Simple, transparent pricing for teams of all sizes. Start with a 14-day free trial of Navis Docs Pro, self-host for free, or contact us for Enterprise.",
  },
  twitter: {
    title: "Pricing | Navis Docs",
    description:
      "Simple, transparent pricing for teams of all sizes. Start with a 14-day free trial of Navis Docs Pro, self-host for free, or contact us for Enterprise.",
  },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl">Pricing</h1>
        <p className="text-muted-foreground">
          Simple, transparent pricing. Start free — no credit card required.
        </p>
      </div>
      <MarketingPricingTiers
        selfHosted={<SelfHostedPlanCard />}
        enterprise={<EnterprisePlanCard isActive={false} />}
      />
    </div>
  );
}
