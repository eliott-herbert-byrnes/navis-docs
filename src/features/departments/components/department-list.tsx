import { EmptyState } from "@/components/empty-state";
import { getDepartments } from "../queries/get-departments";
import { DepartmentCard } from "./department-card";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";

type DepartmentListProps = {
  orgId: string;
};

const DepartmentList = async ({ orgId }: DepartmentListProps) => {
  const { list: departments } = await getDepartments(orgId);
  const user = await getSessionUser();
  const isAdmin = user ? await isOrgAdminOrOwner(user.userId) : false;

  return (
    <>
      {departments.length ? (
        <div className="flex flex-row flex-wrap gap-4">
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} isAdmin={isAdmin} />
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
