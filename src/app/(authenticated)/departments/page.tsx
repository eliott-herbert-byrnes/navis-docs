import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DepartmentList } from "@/features/departments/components/department-list";
import { DepartmentCreateButton } from "@/features/departments/components/department-buttons/department-create-button";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { signInPath } from "@/app/paths";
import { PageContainer } from "@/components/ui/page-container";

function DepartmentListSkeleton() {
  return (
    <div className="flex flex-row flex-wrap gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="w-full max-w-[250px] rounded-lg border p-4 shadow-none"
        >
          <div className="space-y-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
      <Suspense fallback={<DepartmentListSkeleton />}>
        <DepartmentList />
      </Suspense>
    </PageContainer>
  );
}
