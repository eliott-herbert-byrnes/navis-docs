"use client";

import { DepartmentDialog } from "./department-create-dialog";
import { useCreateDepartment } from "../../hooks/use-department-mutations";

const DepartmentCreateButton = () => {
  const { createDepartment, isPending, isDialogOpen, setIsDialogOpen } =
    useCreateDepartment();

  return (
    <DepartmentDialog
      title="Create Department"
      description="Create a new department and add teams"
      onConfirm={createDepartment}
      isPending={isPending}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    />
  );
};

export { DepartmentCreateButton };
