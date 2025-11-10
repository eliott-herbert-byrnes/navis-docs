"use server";
import { homePath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Products } from "@/features/stripe/components/product";
import { LucideSettings } from "lucide-react";
import { CustomerPortalForm } from "@/features/stripe/components/customer-portal-form";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

const SubscriptionPage = async () => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org || !isAdmin) redirect(homePath());

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
      <Suspense fallback={<Spinner />}>
        <Products orgSlug={org.slug} />
      </Suspense>
    </>
  );
};

export default SubscriptionPage;
