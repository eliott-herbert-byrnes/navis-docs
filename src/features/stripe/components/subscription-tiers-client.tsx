"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProPlanCardClient } from "./pro-plan-card-client";
import type { BillingInterval } from "./pro-plan-card-client";

type SubscriptionTiersClientProps = {
  selfHosted: ReactNode;
  enterprise: ReactNode;
  orgSlug: string | null | undefined;
  productName: string;
  description: string;
  marketingFeatures: { name?: string | null }[];
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  monthlyUnitAmount: number | null;
  monthlyCurrency: string;
  annualUnitAmount: number | null;
  annualCurrency: string;
  activePlan: string | null | undefined;
  activeSubscription: boolean;
  isTrialing: boolean;
  isSelfHosted: boolean;
  isEnterprise: boolean;
};

export function SubscriptionTiersClient({
  selfHosted,
  enterprise,
  monthlyPriceId,
  annualPriceId,
  ...rest
}: SubscriptionTiersClientProps) {
  const initial: BillingInterval = monthlyPriceId
    ? "monthly"
    : annualPriceId
      ? "annual"
      : "monthly";
  const [billing, setBilling] = useState<BillingInterval>(initial);

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
            disabled={!monthlyPriceId}
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
            disabled={!annualPriceId}
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
        <ProPlanCardClient
          {...rest}
          monthlyPriceId={monthlyPriceId}
          annualPriceId={annualPriceId}
          billing={billing}
        />
        {enterprise}
      </div>
    </div>
  );
}
