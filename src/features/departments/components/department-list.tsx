import { EmptyState } from "@/components/empty-state";
import { getDepartments } from "../queries/get-departments";
import { DepartmentCard } from "./department-card";

type DepartmentListProps = {
  orgId: string;
};

const DepartmentList = async ({ orgId }: DepartmentListProps) => {
  const { list: departments } = await getDepartments(orgId);

  return (
    <>
      {departments.length ? (
        // <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-row flex-wrap gap-4">
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
