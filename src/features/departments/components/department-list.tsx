"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { DepartmentCard } from "./department-card";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

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

const DepartmentList = () => {
  const { data, isLoading, isError } = trpc.department.list.useQuery();

  if (isLoading) {
    return <DepartmentListSkeleton />;
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
        <div className="flex flex-row flex-wrap gap-5">
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
