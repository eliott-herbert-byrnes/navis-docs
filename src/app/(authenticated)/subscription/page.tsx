import { homePath, signInPath } from "@/app/paths";
import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/Heading";
import { useState } from "react";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubscriptionButtons } from "@/features/subscription/components/subscription-buttons";
import { Badge } from "@/components/ui/badge";

const SubscriptionPage = async () => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(homePath());

  const planBadge = (
    <Badge variant="outline">
        {`${org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}`}
    </Badge>
  )

  return (
    <>
      <Heading title="Subscription" description="Manage your subscription" actions={planBadge}/>

      <SubscriptionButtons />
    </>
  );
};

export default SubscriptionPage;
