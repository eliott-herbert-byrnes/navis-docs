"use client";

import { useDeleteDepartment } from "../../hooks/use-department-mutations";
import { DepartmentDeleteDialogSettings } from "./department-delete-dialog-settings";

const DepartmentDeleteButtonSettings = ({
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
    <DepartmentDeleteDialogSettings
      title="Are you sure you want to delete this department?"
      description="All associated teams and procedures will be deleted as well. This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

export { DepartmentDeleteButtonSettings };
