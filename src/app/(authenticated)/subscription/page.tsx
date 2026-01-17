"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Products } from "@/features/stripe/components/product";
import { LucideSettings } from "lucide-react";
import { CustomerPortalForm } from "@/features/stripe/components/customer-portal-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionPage = async () => {
  const user = await getSessionUser();

  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
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
    <>
      <Heading
        title="Subscription"
        description="Manage your subscription"
        actions={manageSubscription}
      />
      <Suspense fallback={<Skeleton />}>
        <Products orgSlug={org.slug} />
      </Suspense>
    </>
  );
};

export default SubscriptionPage;
