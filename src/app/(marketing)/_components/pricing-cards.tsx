"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { dashboardPath } from "@/app/paths";
import { toCurrencyFromCent } from "@/utils/currency";
import type { BillingInterval } from "@/features/stripe/components/pro-plan-card-client";
import { PRO_DESCRIPTION, PRO_FEATURES } from "@/features/stripe/plan-content";

const MONTHLY_PRICE_CENTS = 1000;
const ANNUAL_PRICE_CENTS = 9600;
const ANNUAL_EFFECTIVE_MONTHLY = Math.round(ANNUAL_PRICE_CENTS / 12);
const CURRENCY = "usd";

function MarketingProPlanCard({ billing }: { billing: BillingInterval }) {
  return (
    <Card className="flex w-full animate-fade-from-top flex-col border-primary/20 shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-xl">Pro</CardTitle>
          <Badge
            variant="secondary"
            className="gap-1 border border-cyan-700 bg-cyan-700/10 text-primary"
          >
            <LucideSparkles className="size-3.5" aria-hidden />
            14-day trial
          </Badge>
        </div>
        {billing === "monthly" && (
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">
              {toCurrencyFromCent(MONTHLY_PRICE_CENTS, CURRENCY)}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                per user/month
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Billed monthly per seat in your organization.
            </p>
          </div>
        )}
        {billing === "annual" && (
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">
              {toCurrencyFromCent(ANNUAL_EFFECTIVE_MONTHLY, CURRENCY)}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / seat / month
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Billed annually —{" "}
              {toCurrencyFromCent(ANNUAL_PRICE_CENTS, CURRENCY)}/ year per seat
              ({toCurrencyFromCent(ANNUAL_EFFECTIVE_MONTHLY, CURRENCY)}/ mo
              effective).
            </p>
            <p className="text-xs font-medium text-primary">
              Save 20% vs paying monthly.
            </p>
          </div>
        )}
        <CardDescription className="h-[47px] whitespace-normal text-sm">
          {PRO_DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <ul className="space-y-2 border-t pt-4">
          {PRO_FEATURES.map((feature) => (
            <li key={feature.name} className="flex gap-x-2 text-sm">
              <LucideCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>{feature.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-3 border-t pt-6">
        <Button asChild className="w-full" variant={"outline"}>
          <Link href={dashboardPath()}>
            <span className="font-semibold">Get Started</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

type MarketingPricingTiersProps = {
  selfHosted: ReactNode;
  enterprise: ReactNode;
};

export function MarketingPricingTiers({
  selfHosted,
  enterprise,
}: MarketingPricingTiersProps) {
  const [billing, setBilling] = useState<BillingInterval>("monthly");

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex justify-center">
        <div
          className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground"
          role="tablist"
          aria-label="Billing period"
        >
          <Button
            type="button"
            role="tab"
            aria-selected={billing === "monthly"}
            variant="ghost"
            className={cn(
              "h-[calc(100%-1px)] rounded-md border border-transparent px-4 py-1 text-sm font-medium shadow-none",
              billing === "monthly" &&
                "border-input bg-background text-foreground shadow-sm",
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
            className={cn(
              "h-[calc(100%-1px)] rounded-md border border-transparent px-4 py-1 text-sm font-medium shadow-none",
              billing === "annual" &&
                "border-input bg-background text-foreground shadow-sm",
            )}
            onClick={() => setBilling("annual")}
          >
            Annual
          </Button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {selfHosted}
        <MarketingProPlanCard billing={billing} />
        {enterprise}
      </div>
    </div>
  );
}
