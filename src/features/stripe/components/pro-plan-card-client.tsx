"use client";

import { useState } from "react";
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
import { LucideCheck, LucideSparkles } from "lucide-react";
import { CheckoutSessionForm } from "./checkout-session-form";
import { toCurrencyFromCent } from "@/utils/currency";
import { cn } from "@/lib/utils";

export type BillingInterval = "monthly" | "annual";

type MarketingFeature = { name?: string | null };

type ProPlanCardClientProps = {
  orgSlug: string | null | undefined;
  productName: string;
  description: string;
  marketingFeatures: MarketingFeature[];
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  monthlyUnitAmount: number | null;
  monthlyCurrency: string;
  annualUnitAmount: number | null;
  annualCurrency: string;
  activePlan: string | null | undefined;
  activeSubscription: boolean;
};

export function ProPlanCardClient({
  orgSlug,
  productName,
  description,
  marketingFeatures,
  monthlyPriceId,
  annualPriceId,
  monthlyUnitAmount,
  monthlyCurrency,
  annualUnitAmount,
  annualCurrency,
  activePlan,
  activeSubscription,
}: ProPlanCardClientProps) {
  const initial: BillingInterval =
    monthlyPriceId ? "monthly" : annualPriceId ? "annual" : "monthly";
  const [billing, setBilling] = useState<BillingInterval>(initial);

  const effectiveMonthlyFromAnnual =
    annualUnitAmount != null ? Math.round(annualUnitAmount / 12) : null;

  const selectedPriceId =
    billing === "monthly" ? monthlyPriceId : annualPriceId;

  return (
    <div className="flex flex-col items-center justify-center gap-6 mx-auto my-auto w-full max-w-md">
      <Card className="w-full flex flex-col animate-fade-from-top border-primary/20 shadow-md">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="text-xl">{productName}</CardTitle>
            <Badge
              variant="secondary"
              className="gap-1 border border-primary/20 bg-primary/10 text-primary"
            >
              <LucideSparkles className="size-3.5" aria-hidden />
              14-day trial
            </Badge>
          </div>
          <CardDescription className="text-sm whitespace-normal">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div
            className="bg-muted text-muted-foreground inline-flex h-9 w-full items-center justify-center rounded-lg p-[3px]"
            role="tablist"
            aria-label="Billing period"
          >
            <Button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              variant="ghost"
              disabled={!monthlyPriceId}
              className={cn(
                "h-[calc(100%-1px)] flex-1 rounded-md border border-transparent px-2 py-1 text-sm font-medium shadow-none",
                billing === "monthly" &&
                  "bg-background text-foreground shadow-sm border-input",
              )}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </Button>
            <Button
              type="button"
              role="tab"
              aria-selected={billing === "annual"}
              variant="ghost"
              disabled={!annualPriceId}
              className={cn(
                "h-[calc(100%-1px)] flex-1 rounded-md border border-transparent px-2 py-1 text-sm font-medium shadow-none",
                billing === "annual" &&
                  "bg-background text-foreground shadow-sm border-input",
              )}
              onClick={() => setBilling("annual")}
            >
              Annual
            </Button>
          </div>

          {billing === "monthly" &&
            monthlyUnitAmount != null &&
            monthlyPriceId && (
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                  {toCurrencyFromCent(monthlyUnitAmount, monthlyCurrency)}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / seat / month
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Billed monthly per seat in your organization.
                </p>
              </div>
            )}

          {billing === "annual" &&
            annualUnitAmount != null &&
            effectiveMonthlyFromAnnual != null &&
            annualPriceId && (
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                  {toCurrencyFromCent(
                    effectiveMonthlyFromAnnual,
                    annualCurrency,
                  )}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / seat / month
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Billed annually —{" "}
                  {toCurrencyFromCent(annualUnitAmount, annualCurrency)}/ year per
                  seat (
                  {toCurrencyFromCent(
                    effectiveMonthlyFromAnnual,
                    annualCurrency,
                  )}
                  / mo effective).
                </p>
              </div>
            )}

          {billing === "monthly" && !monthlyPriceId && (
            <p className="text-sm text-muted-foreground">
              Monthly pricing is not configured in Stripe.
            </p>
          )}
          {billing === "annual" && !annualPriceId && (
            <p className="text-sm text-muted-foreground">
              Annual pricing is not configured in Stripe.
            </p>
          )}

          <ul className="space-y-2 pt-2 border-t">
            {marketingFeatures.map((feature, index) => (
              <li
                key={feature.name ?? `feature-${index}`}
                className="flex gap-x-2 text-sm"
              >
                <LucideCheck
                  className="size-4 shrink-0 text-primary mt-0.5"
                  aria-hidden
                />
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="mt-auto flex-col items-stretch gap-3 border-t pt-6">
          {selectedPriceId ? (
            <CheckoutSessionForm
              key={selectedPriceId}
              orgSlug={orgSlug}
              priceId={selectedPriceId}
              activePlan={activePlan}
              activeSubscription={activeSubscription}
            >
              <span className="font-semibold">Continue to checkout</span>
              <span className="text-xs font-normal text-primary-foreground/80">
                {billing === "monthly"
                  ? "14-day trial, then billed monthly per seat"
                  : "14-day trial, then billed annually per seat"}
              </span>
            </CheckoutSessionForm>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
