import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import { onboardingPath, signInPath } from "@/app/paths";

export default async function ProcessPage() {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(onboardingPath());

  return (
    <>
      <Heading
        title="Processes"
        description="View and manage your processes"
        // actions={<ProcessCreateButton />}
      />
      <Suspense fallback={<Spinner />}>
        <EmptyState
          title="No processes found"
          body="Create a new process to get started"
        />
      </Suspense>
    </>
  );
}
