"use client";

import { ProcedureErrorDeleteDialog } from "./procedure-error-delete-dialog";
import { useDeleteError } from "../hooks/use-errors-mutations";

const ProcedureErrorDeleteButton = ({ errorId }: { errorId: string }) => {
  const { deleteError, isPending } = useDeleteError();

  return (
    <ProcedureErrorDeleteDialog
      title="Are you sure you want to delete this error report?"
      description="This action cannot be undone."
      onConfirm={() => deleteError(errorId)}
      isPending={isPending}
    />
  );
};

export { ProcedureErrorDeleteButton };
