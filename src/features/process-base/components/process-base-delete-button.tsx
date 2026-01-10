"use client";

import { useDeleteProcessFromBase } from "./hook/use-process-base-mutations";
import { ProcessBaseDeleteDialog } from "./process-base-delete-dialog";

const ProcessBaseDeleteButton = ({ processId }: { processId: string }) => {
  const { deleteProcess, isPending } = useDeleteProcessFromBase();

  const handleDelete = () => {
    deleteProcess(processId);
  };

  return (
    <ProcessBaseDeleteDialog
      title="Are you sure you want to delete this process?"
      description="This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

export { ProcessBaseDeleteButton };
