import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStripe } from "@/lib/stripe";
import { LucideBuilding2 } from "lucide-react";
import { ProPlanCardClient } from "./pro-plan-card-client";
import { getStripeCustomerByOrg } from "../queries/get-stripe-customer";
import { OrgPlan } from "@prisma/client";
import Stripe from "stripe";

const PRO_DESCRIPTION =
  "Unlimited procedures, departments, and teams, AI assistant included, priority support & onboarding, advanced analytics (coming soon).";

const ENTERPRISE_DESCRIPTION =
  "Full platform access with contract-based billing. Your organization is provisioned for Enterprise — contact your account team for seat changes or billing updates.";

const DEFAULT_MARKETING_FEATURES = [
  { name: "Unlimited procedures, departments, and teams" },
  { name: "AI assistant included" },
  { name: "Priority support & onboarding" },
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

function EnterprisePlanCard() {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mx-auto my-auto w-full max-w-md">
      <Card className="w-full flex flex-col animate-fade-from-top border-muted">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <LucideBuilding2 className="size-5 text-muted-foreground" />
              Enterprise
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Provisioned
            </Badge>
          </div>
          <CardDescription className="text-sm whitespace-normal">
            {ENTERPRISE_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Billing and seats are managed outside of self-serve checkout. Reach
            out to your Navis account contact if you need changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function SelfHostedPlanCard() {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mx-auto my-auto w-full max-w-md">
      <Card className="w-full flex flex-col animate-fade-from-top border-dashed">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">Self-Hosted</CardTitle>
            <Badge variant="secondary">Self-Hosted</Badge>
          </div>
          <CardDescription className="text-sm whitespace-normal">
            {SELF_HOSTED_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Subscription management and Stripe checkout are not used for this
            deployment. Visit documentation for upgrading or migrating to
            cloud-hosted billing if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

type ProductsProps = {
  orgSlug: string | null | undefined;
};

const Products = async ({ orgSlug }: ProductsProps) => {
  const stripeCustomer = await getStripeCustomerByOrg(orgSlug);

  let subscriptionStatus = stripeCustomer?.stripeSubscriptionStatus;
  if (stripeCustomer?.stripeSubscriptionId) {
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
  const activePlan = stripeCustomer?.plan;

  if (stripeCustomer?.plan === OrgPlan.enterprise) {
    return <EnterprisePlanCard />;
  }

  const products = await getStripe().products.list({ active: true });

  const proProduct =
    products.data.find((p) => p.metadata?.plan === "pro") ?? products.data[0];

  if (!proProduct) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No Pro product is configured in Stripe.
      </p>
    );
  }

  const prices = await getStripe().prices.list({
    active: true,
    product: proProduct.id,
  });

  const monthly = pickPrice(prices.data, "monthly");
  const annual = pickPrice(prices.data, "annual");

  const marketingFeatures =
    proProduct.marketing_features?.length &&
    proProduct.marketing_features.some((f) => f.name)
      ? proProduct.marketing_features
      : DEFAULT_MARKETING_FEATURES;

  return (
    <ProPlanCardClient
      orgSlug={orgSlug}
      productName={proProduct.name}
      description={PRO_DESCRIPTION}
      marketingFeatures={marketingFeatures}
      monthlyPriceId={monthly?.id ?? null}
      annualPriceId={annual?.id ?? null}
      monthlyUnitAmount={monthly?.unit_amount ?? null}
      monthlyCurrency={monthly?.currency ?? "usd"}
      annualUnitAmount={annual?.unit_amount ?? null}
      annualCurrency={annual?.currency ?? "usd"}
      activePlan={activePlan}
      activeSubscription={activeSubscription}
    />
  );
};

export { Products };
