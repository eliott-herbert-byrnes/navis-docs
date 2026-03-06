import { Heading } from "@/components/ui/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signInPath } from "./paths";
import { DepartmentList } from "@/features/departments/components/department-list";
import { DepartmentCreateButton } from "@/features/departments/components/department-buttons/department-create-button";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateStaticParams() {
  return [{}];
}

export default async function Home() {
  const user = await getSessionUser();

  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
  if (!org || !user) redirect(signInPath());

  return (
    <>
      <Heading
        title="Departments"
        description="Manage your organization's departments"
        actions={isAdmin ? <DepartmentCreateButton /> : null}
      />
      <Suspense fallback={<Skeleton />}>
        <DepartmentList />
      </Suspense>
    </>
  );
}
