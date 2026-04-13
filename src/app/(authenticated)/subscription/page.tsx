"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { isCloud } from "@/lib/deploy-mode";
import { redirect } from "next/navigation";
import {
  Products,
  SelfHostedPlanCard,
} from "@/features/stripe/components/product";
import { LucideSettings } from "lucide-react";
import { CustomerPortalForm } from "@/features/stripe/components/customer-portal-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";

function ProductsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border p-6">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="mt-4 h-11 w-full" />
    </div>
  );
}

const SubscriptionPage = async () => {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const manageSubscription =
    isCloud() && org.stripeSubscriptionId ? (
      <CustomerPortalForm>
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
        <SelfHostedPlanCard />
      )}
    </PageContainer>
  );
};

export default SubscriptionPage;
