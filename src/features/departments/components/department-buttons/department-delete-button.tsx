"use client";

import { DepartmentDeleteDialog } from "./department-delete-dialog";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

const DepartmentDeleteButton = ({
  departmentId,
  departmentName,
  isAdmin,
}: {
  departmentId: string;
  departmentName: string;
  isAdmin: boolean;
}) => {
  const utils = trpc.useUtils();
  const deleteDeptartment = trpc.department.delete.useMutation({
    onSuccess: () => {
      utils.department.list.invalidate();
      toast.success("Department deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    deleteDeptartment.mutate({ departmentId, departmentName });
  };

  return (
    <DepartmentDeleteDialog
      title="Are you sure you want to delete this department?"
      description="All associated teams and processes will be deleted as well. This action cannot be undone."
      onConfirm={handleDelete}
      isPending={deleteDeptartment.isPending}
      disabled={!isAdmin || deleteDeptartment.isPending}
    />
  );
};

export { DepartmentDeleteButton };
