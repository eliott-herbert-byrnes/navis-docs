"use client";

import { DepartmentDeleteDialog } from "./department-delete-dialog";
import { useDeleteDepartment } from "../../hooks/use-department-mutations";
const DepartmentDeleteButton = ({
  departmentId,
  departmentName,
}: {
  departmentId: string;
  departmentName: string;
}) => {
  const { deleteDepartment, isPending } = useDeleteDepartment();

  const handleDelete = () => {
    deleteDepartment({ departmentId, departmentName });
  };

  return (
    <DepartmentDeleteDialog
      title="Are you sure you want to delete this department?"
      description="All associated teams and procedures will be deleted as well. This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

export { DepartmentDeleteButton };
