import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import { onboardingPath, signInPath } from "./paths";
import { DepartmentList } from "@/features/departments/components/department-list";
import { DepartmentCreateButton } from "@/features/departments/components/department-buttons/department-create-button";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(onboardingPath());

  return (
    <>
      <Heading
        title="Departments"
        description="Manage your departments"
        actions={<DepartmentCreateButton />}
      />
      <Suspense fallback={<Spinner />}>
        <DepartmentList orgId={org.id} />
      </Suspense>
    </>
  );
}
