"use client";

import { EmptyState } from "@/components/empty-state";
import { DepartmentCard } from "./department-card";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { getCachedDepartments } from "@/lib/cache-queries";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

type DepartmentListProps = {
  isAdmin: boolean;
};

const DepartmentList = ({ isAdmin }: DepartmentListProps) => {
  const { data, isLoading } = trpc.department.list.useQuery();

  if (isLoading) return <Skeleton className="h-48 w-1/4 rounded-md" />;

  const departments = data?.list ?? [];

  return (
    <>
      {departments.length ? (
        <div className="flex flex-row flex-wrap gap-4">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No departments found"
          body="Create a new department to get started"
        />
      )}
    </>
  );
};

export { DepartmentList };
