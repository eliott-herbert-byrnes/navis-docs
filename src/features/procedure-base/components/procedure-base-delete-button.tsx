"use client";

import { useDeleteProcedureFromBase } from "../hook/use-procedure-base-mutations";
import { ProcedureBaseDeleteDialog } from "./procedure-base-delete-dialog";

const ProcedureBaseDeleteButton = ({
  procedureId,
}: {
  procedureId: string;
}) => {
  const { deleteProcedure, isPending } = useDeleteProcedureFromBase();

  const handleDelete = () => {
    deleteProcedure(procedureId);
  };

  return (
    <ProcedureBaseDeleteDialog
      title="Are you sure you want to delete this procedure?"
      description="This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

export { ProcedureBaseDeleteButton };
