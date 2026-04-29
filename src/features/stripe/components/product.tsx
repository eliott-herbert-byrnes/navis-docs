import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe";
import { isSelfHosted } from "@/lib/deploy-mode";
import { LucideCheck } from "lucide-react";
import { getStripeCustomerByOrg } from "../queries/get-stripe-customer";
import { OrgPlan } from "@prisma/client";
import Stripe from "stripe";
import { SubscriptionTiersClient } from "./subscription-tiers-client";
import { PRO_DESCRIPTION, PRO_FEATURES } from "../plan-content";

const ENTERPRISE_DESCRIPTION =
  "Full platform access with contract-based billing. Your organization is provisioned for Enterprise — contact your account team for seat changes or billing updates.";

const SELF_HOSTED_FEATURES = [
  { name: "Full platform access on your own infrastructure" },
  { name: "Complete data ownership & privacy" },
  { name: "No seat-based billing" },
  { name: "Bring your own AI API keys" },
  { name: "All core features included" },
  { name: "Community support via GitHub" },
];

const ENTERPRISE_FEATURES = [
  { name: "Everything in Pro" },
  { name: "Contract-based, custom billing" },
  { name: "Dedicated account manager" },
  { name: "Custom onboarding & training" },
  { name: "SLA-backed priority support" },
  { name: "Advanced analytics (coming soon)" },
];

const SELF_HOSTED_DESCRIPTION =
  "This deployment runs on your infrastructure. All product features are available without a cloud subscription or Stripe checkout.";

function pickPrice(
  prices: Stripe.Price[],
  billing: "monthly" | "annual",
) {
  const meta = billing === "monthly" ? "monthly" : "annual";
  return (
    prices.find((p) => p.metadata?.billing === meta) ??
    prices.find((p) =>
      billing === "monthly"
        ? p.recurring?.interval === "month"
        : p.recurring?.interval === "year",
    ) ??
    null
  );
}

export function EnterprisePlanCard({ isActive }: { isActive: boolean }) {
  return (
    <Card className="flex w-full animate-fade-from-top flex-col border-muted">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            Enterprise
          </CardTitle>
          {isActive ? (
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Custom pricing
            </Badge>
          )}
        </div>
        <p className="text-2xl font-medium tracking-tight">Contact Sales</p>
        <CardDescription className="whitespace-normal text-sm h-[75px]">
          {ENTERPRISE_DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 border-t pt-4">
          {ENTERPRISE_FEATURES.map((f) => (
            <li key={f.name} className="flex gap-x-2 text-sm">
              <LucideCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto border-t pt-6">
        <Button asChild variant="outline" className="w-full">
          <a href="mailto:hello@navisdocs.com">Contact us</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SelfHostedPlanCard() {
  return (
    <Card className="flex w-full animate-fade-from-top flex-col border-dashed">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl">Self-Hosted</CardTitle>
          <Badge variant="secondary">Self-Hosted</Badge>
        </div>
        <p className="text-2xl font-medium tracking-tight">Free</p>
        <CardDescription className="whitespace-normal text-sm h-[75px]">
          {SELF_HOSTED_DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 border-t pt-4">
          {SELF_HOSTED_FEATURES.map((f) => (
            <li key={f.name} className="flex gap-x-2 text-sm">
              <LucideCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto border-t pt-6">
        <Button asChild variant="outline" className="w-full">
          <a
            href="https://github.com/eliott-herbert-byrnes/navis-docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

type ProductsProps = {
  orgSlug: string | null | undefined;
};

const Products = async ({ orgSlug }: ProductsProps) => {
  const stripeCustomer = await getStripeCustomerByOrg(orgSlug);
  const plan = stripeCustomer?.plan;
  const isEnterprise = plan === OrgPlan.enterprise;

  let subscriptionStatus = stripeCustomer?.stripeSubscriptionStatus;
  if (
    stripeCustomer?.stripeSubscriptionId &&
    !isSelfHosted() &&
    !isEnterprise
  ) {
    try {
      const sub = await getStripe().subscriptions.retrieve(
        stripeCustomer.stripeSubscriptionId,
      );
      subscriptionStatus = sub.status;
    } catch {
      /* keep DB status */
    }
  }

  const activeSubscription =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const isTrialing = subscriptionStatus === "trialing";

  let monthly: Stripe.Price | null = null;
  let annual: Stripe.Price | null = null;
  let proProduct: Stripe.Product | null = null;
  let marketingFeatures: { name?: string | null }[] = [...PRO_FEATURES];

  if (!isSelfHosted() && !isEnterprise) {
    const products = await getStripe().products.list({ active: true });
    proProduct =
      products.data.find((p) => p.metadata?.plan === "pro") ??
      products.data[0] ??
      null;
    if (proProduct) {
      const prices = await getStripe().prices.list({
        active: true,
        product: proProduct.id,
      });
      monthly = pickPrice(prices.data, "monthly");
      annual = pickPrice(prices.data, "annual");
      if (proProduct.marketing_features?.some((f) => f.name)) {
        marketingFeatures = proProduct.marketing_features;
      }
    }
  }

  return (
    <SubscriptionTiersClient
      selfHosted={<SelfHostedPlanCard />}
      enterprise={<EnterprisePlanCard isActive={isEnterprise} />}
      orgSlug={orgSlug}
      productName={proProduct?.name ?? "Pro"}
      description={PRO_DESCRIPTION}
      marketingFeatures={marketingFeatures}
      monthlyPriceId={monthly?.id ?? null}
      annualPriceId={annual?.id ?? null}
      monthlyUnitAmount={monthly?.unit_amount ?? null}
      monthlyCurrency={monthly?.currency ?? "usd"}
      annualUnitAmount={annual?.unit_amount ?? null}
      annualCurrency={annual?.currency ?? "usd"}
      activePlan={plan}
      activeSubscription={activeSubscription}
      isTrialing={isTrialing}
      isSelfHosted={isSelfHosted()}
      isEnterprise={isEnterprise}
    />
  );
};

export { Products };
