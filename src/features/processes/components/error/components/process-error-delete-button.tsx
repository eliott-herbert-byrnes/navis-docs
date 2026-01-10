"use client";

import { ProcessErrorDeleteDialog } from "./process-error-delete-dialog";
import { useDeleteError } from "../hooks/use-errors-mutations";

const ProcessErrorDeleteButton = ({ errorId }: { errorId: string }) => {
  const { deleteError, isPending } = useDeleteError();

  return (
    <ProcessErrorDeleteDialog
      title="Are you sure you want to delete this error report?"
      description="This action cannot be undone."
      onConfirm={() => deleteError(errorId)}
      isPending={isPending}
    />
  );
};

export { ProcessErrorDeleteButton };