"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { isCloud } from "@/lib/deploy-mode";
import { redirect } from "next/navigation";
import { Products } from "@/features/stripe/components/product";
import { LucideSettings } from "lucide-react";
import { CustomerPortalForm } from "@/features/stripe/components/customer-portal-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";

function ProductsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border p-5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-3 h-8 w-20" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="mt-6 h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

const SubscriptionPage = async () => {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const manageSubscription = isCloud() ? (
    <CustomerPortalForm orgSlug={org.slug}>
      <>
        <LucideSettings className="w-4 h-4" />
        Manage Subscription
      </>
    </CustomerPortalForm>
  ) : null;

  return (
    <PageContainer>
      <Heading
        title="Subscription"
        description="Manage the subscription for this organization"
        actions={manageSubscription}
      />
      {isCloud() ? (
        <Suspense fallback={<ProductsSkeleton />}>
          <Products orgSlug={org.slug} />
        </Suspense>
      ) : (
        <p className="text-muted-foreground">
          Billing and Stripe checkout are not available for self-hosted
          deployments.
        </p>
      )}
    </PageContainer>
  );
};

export default SubscriptionPage;
