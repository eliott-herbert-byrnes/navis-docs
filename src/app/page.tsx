import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { homePath, signInPath } from "./paths";
import { DepartmentList } from "@/features/departments/components/department-list";
import { DepartmentCreateButton } from "@/features/departments/components/department-buttons/department-create-button";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const { org, isAdmin } = await getUserOrgWithRole(user.userId);
  if (!org || !isAdmin) redirect(homePath());

  return (
    <>
      <Heading
        title="Departments"
        description="Manage your departments"
        actions={isAdmin ? <DepartmentCreateButton isAdmin={isAdmin} /> : null}
      />
      <Suspense fallback={<Spinner />}>
        <DepartmentList orgId={org.id} />
      </Suspense>
    </>
  );
}
