"use client";

import { DepartmentOverview } from "./department-overview";
import { useRenameDepartment } from "../../hooks/use-department-mutations";

type DepartmentOverviewButtonProps = {
  departmentId: string;
  title: string;
};

const DepartmentOverviewButton = ({
  departmentId,
  title,
}: DepartmentOverviewButtonProps) => {
  const { renameDepartment, isPending } = useRenameDepartment();

  const handleRename = (
    oldDepartmentName: string,
    newDepartmentName: string,
  ) => {
    renameDepartment(departmentId, oldDepartmentName, newDepartmentName);
  };

  return (
    <DepartmentOverview
      title={title}
      onConfirm={handleRename}
      isPending={isPending}
      disabled={isPending}
      departmentId={departmentId}
    />
  );
};

export { DepartmentOverviewButton };
