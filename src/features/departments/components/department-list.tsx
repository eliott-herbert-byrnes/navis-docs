"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { DepartmentCard } from "./department-card";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

const DepartmentList = () => {
  const { data, isLoading, isError } = trpc.department.list.useQuery();

  if (isLoading) {
    return (
      <>
        <div className="flex flex-row flex-wrap gap-4">
          <Skeleton className="h-48 w-1/4 rounded-md" />
          <Skeleton className="h-48 w-1/4 rounded-md" />
          <Skeleton className="h-48 w-1/4 rounded-md" />
        </div>
      </>
    );
  } else if (isError) {
    return (
      <EmptyState
        title="Error loading departments"
        body="Please try again later, or contact support if the problem persists"
      />
    );
  }

  const departments = data?.list ?? [];

  return (
    <>
      {departments.length ? (
        <div className="flex flex-row flex-wrap gap-6">
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
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
