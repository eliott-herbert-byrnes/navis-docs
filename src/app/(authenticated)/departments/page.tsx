import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DepartmentList } from "@/features/departments/components/department-list";
import { DepartmentCreateButton } from "@/features/departments/components/department-buttons/department-create-button";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { signInPath } from "@/app/paths";
import { PageContainer } from "@/components/ui/page-container";

export default async function DepartmentsPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());
  const { org, isAdmin } = ctx;
  if (!org) redirect(signInPath());

  return (
    <PageContainer>
      <Heading
        title="Departments"
        description="Manage your organization's departments"
        actions={isAdmin ? <DepartmentCreateButton /> : null}
      />
      <Suspense fallback={<Skeleton />}>
        <DepartmentList />
      </Suspense>
    </PageContainer>
  );
}
