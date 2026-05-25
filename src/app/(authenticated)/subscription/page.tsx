"use server";
import { dashboardPath, onboardingPath } from "@/app/paths";
import { DemoNotAvailable } from "@/components/demo/not-available";
import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { isDemoContext } from "@/lib/demo";
import { redirect } from "next/navigation";
import { BillingStatusBanner } from "@/features/stripe/components/billing-status-banner";
import { Products } from "@/features/stripe/components/product";
import { SubscriptionCheckoutToast } from "@/features/stripe/components/subscription-checkout-toast";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";

function ProductsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex justify-center">
        <Skeleton className="h-9 w-48 rounded-lg" />
      </div>
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4 rounded-lg border p-6">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SubscriptionPage = async () => {
  if (await isDemoContext()) {
    return <DemoNotAvailable feature="Subscription" />;
  }

  const ctx = await getSessionContext();
  const { org, isAdmin, accessLevel, graceEndsAt } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(dashboardPath());

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <SubscriptionCheckoutToast />
      </Suspense>
      <Heading
        title="Subscription"
        description="Manage the subscription for this organization"
      />
      <BillingStatusBanner
        accessLevel={accessLevel ?? "full"}
        graceEndsAt={graceEndsAt ?? null}
        stripeSubscriptionStatus={org.stripeSubscriptionStatus}
        isAdmin={isAdmin ?? false}
        hideSubscribeLink
      />
      <Suspense fallback={<ProductsSkeleton />}>
        <Products orgSlug={org.slug} />
      </Suspense>
    </PageContainer>
  );
};

export default SubscriptionPage;
