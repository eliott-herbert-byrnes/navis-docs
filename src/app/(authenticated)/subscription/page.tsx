"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Products } from "@/features/stripe/components/product";
import { LucideSettings } from "lucide-react";
import { CustomerPortalForm } from "@/features/stripe/components/customer-portal-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/ui/page-container";

const SubscriptionPage = async () => {
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const manageSubscription = (
    <CustomerPortalForm orgSlug={org.slug}>
      <>
        <LucideSettings className="w-4 h-4" />
        Manage Subscription
      </>
    </CustomerPortalForm>
  );

  return (
    <PageContainer>
      <Heading
        title="Subscription"
        description="Manage the subscription for this organization"
        actions={manageSubscription}
      />
      <Suspense fallback={<Skeleton />}>
        <Products orgSlug={org.slug} />
      </Suspense>
    </PageContainer>
  );
};

export default SubscriptionPage;
