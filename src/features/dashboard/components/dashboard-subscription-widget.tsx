import { Organization } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { subscriptionPath } from "@/app/paths";
import { differenceInDays } from "date-fns";
import { CreditCard } from "lucide-react";
import { resolveOrgWriteAccess } from "@/lib/billing/access";
import { BillingStatusBanner } from "@/features/stripe/components/billing-status-banner";

type DashboardSubscriptionWidgetProps = {
  org: Pick<
    Organization,
    | "plan"
    | "stripeSubscriptionStatus"
    | "currentPeriodEnd"
    | "billingGraceEndsAt"
  >;
  isAdmin: boolean;
};

const isSelfHostedDeploy =
  process.env.NEXT_PUBLIC_DEPLOY_MODE === "self-hosted";

export function DashboardSubscriptionWidget({
  org,
  isAdmin,
}: DashboardSubscriptionWidgetProps) {
  const { accessLevel, graceEndsAt } = resolveOrgWriteAccess(org);
  const daysUntilRenewal = org.currentPeriodEnd
    ? differenceInDays(org.currentPeriodEnd, new Date())
    : null;

  const statusVariant =
    org.stripeSubscriptionStatus === "active" ||
    org.stripeSubscriptionStatus === "trialing"
      ? "default"
      : "destructive";

  if (isSelfHostedDeploy) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <BillingStatusBanner
            accessLevel={accessLevel}
            graceEndsAt={graceEndsAt}
            stripeSubscriptionStatus={org.stripeSubscriptionStatus}
            isAdmin={isAdmin}
            compact
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold capitalize">{org.plan}</span>
            <Badge variant="outline" className="text-xs">
              Self-Hosted
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            No cloud billing or renewal dates for this deployment.
          </p>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={subscriptionPath()}>Manage</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <BillingStatusBanner
          accessLevel={accessLevel}
          graceEndsAt={graceEndsAt}
          stripeSubscriptionStatus={org.stripeSubscriptionStatus}
          isAdmin={isAdmin}
          compact
        />
        <div className="flex items-center gap-2">
          <span className="text-sm capitalize font-semibold">{org.plan}</span>
          {org.stripeSubscriptionStatus && (
            <Badge variant={statusVariant} className="capitalize text-xs">
              {org.stripeSubscriptionStatus}
            </Badge>
          )}
        </div>
        {daysUntilRenewal !== null && (
          <p className="text-xs text-muted-foreground">
            Renews in {daysUntilRenewal} day{daysUntilRenewal !== 1 ? "s" : ""}
          </p>
        )}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={subscriptionPath()}>Manage</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
