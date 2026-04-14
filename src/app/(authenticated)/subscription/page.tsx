"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Products } from "@/features/stripe/components/product";
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
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  return (
    <PageContainer>
      <Heading
        title="Subscription"
        description="Manage the subscription for this organization"
      />
      <Suspense fallback={<ProductsSkeleton />}>
        <Products orgSlug={org.slug} />
      </Suspense>
    </PageContainer>
  );
};

export default SubscriptionPage;
