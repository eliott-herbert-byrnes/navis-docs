"use client";

import { useDeleteProcess } from "../hooks/use-process-mutations";
import { ProcessDeleteButtonDialog } from "./process-delete-button-dialog";

const ProcessDeleteButton = ({
  processId,
  isAdmin,
  departmentId,
  teamId,
}: {
  processId: string;
  isAdmin: boolean;
  departmentId: string;
  teamId: string;
}) => {
  const { deleteProcess, isPending } = useDeleteProcess(departmentId, teamId);

  const handleDelete = () => {
    deleteProcess(processId);
  };

  return (
    <ProcessDeleteButtonDialog
      title="Are you sure you want to delete this process?"
      description="This action cannot be undone."
      isPending={isPending}
      onConfirm={handleDelete}
      isAdmin={isAdmin}
    />
  );
};

export { ProcessDeleteButton };
