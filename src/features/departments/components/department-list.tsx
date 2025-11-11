import { EmptyState } from "@/components/empty-state";
import { DepartmentCard } from "./department-card";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { getCachedDepartments } from "@/lib/cache-queries";

type DepartmentListProps = {
  orgId: string;
};

const DepartmentList = async ({ orgId }: DepartmentListProps) => {
  const { list: departments } = await getCachedDepartments(orgId);
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
