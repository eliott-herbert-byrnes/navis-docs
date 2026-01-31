"use client";

import { DepartmentDeleteDialog } from "./department-delete-dialog";
import { useDeleteDepartment } from "../../hooks/use-department-mutations";
import { useAuthContext } from "@/contexts/auth-context";

const DepartmentDeleteButton = ({
  departmentId,
  departmentName,
}: {
  departmentId: string;
  departmentName: string;
}) => {
  const { deleteDepartment, isPending } = useDeleteDepartment();
  const { isAdmin } = useAuthContext();

  const handleDelete = () => {
    deleteDepartment({ departmentId, departmentName });
  };

  return (
    <DepartmentDeleteDialog
      title="Are you sure you want to delete this department?"
      description="All associated teams and procedures will be deleted as well. This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
      disabled={!isAdmin || isPending}
    />
  );
};

export { DepartmentDeleteButton };
