"use client";

import { subscriptionPath } from "@/app/paths";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { OrgAccessLevel } from "@/lib/billing/access";
import { StripeSubscriptionStatus } from "@prisma/client";
import { format } from "date-fns";
import { AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { CustomerPortalForm } from "./customer-portal-form";

type BillingStatusBannerProps = {
  accessLevel: OrgAccessLevel;
  graceEndsAt: Date | null;
  stripeSubscriptionStatus: StripeSubscriptionStatus | null;
  isAdmin: boolean;
  /** Hide subscribe link when already on the subscription page. */
  hideSubscribeLink?: boolean;
  compact?: boolean;
};

export function BillingStatusBanner({
  accessLevel,
  graceEndsAt,
  stripeSubscriptionStatus: _stripeSubscriptionStatus,
  isAdmin,
  hideSubscribeLink = false,
  compact = false,
}: BillingStatusBannerProps) {
  if (accessLevel === "full") {
    return null;
  }

  if (accessLevel === "grace") {
    const graceDate = graceEndsAt
      ? format(graceEndsAt, "MMMM d, yyyy")
      : "soon";

    return (
      <Alert
        className={
          compact
            ? "border-amber-500/50 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50"
            : "mb-6 border-amber-500/50 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50"
        }
      >
        <AlertTriangle className="text-amber-600 dark:text-amber-400" />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Full access until {graceDate}.</span>
          {isAdmin ? (
            <div className="shrink-0 [&_button]:w-auto">
              <CustomerPortalForm>
                <span className="font-medium">Manage billing</span>
              </CustomerPortalForm>
            </div>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      variant="destructive"
      className={compact ? undefined : "mb-6"}
    >
      <Lock />
      <AlertTitle>Organisation is read-only</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {isAdmin
            ? "Subscribe to restore full access."
            : "Contact your admin to restore full access."}
        </span>
        {isAdmin && !hideSubscribeLink ? (
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={subscriptionPath()}>Subscribe</Link>
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
