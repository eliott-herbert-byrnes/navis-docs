"use client";

import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { useDeleteProcedure } from "../hooks/use-procedure-mutations";
import { ProcedureDeleteButtonDialog } from "./procedure-delete-button-dialog";

const ProcedureDeleteButton = ({ procedureId }: { procedureId: string }) => {
  const { departmentId, teamId } = useProcedureRouteContext();
  const { deleteProcedure, isPending } = useDeleteProcedure(
    departmentId,
    teamId,
  );

  const handleDelete = () => {
    deleteProcedure(procedureId);
  };

  return (
    <ProcedureDeleteButtonDialog
      title="Are you sure you want to delete this procedure?"
      description="This action cannot be undone."
      isPending={isPending}
      onConfirm={handleDelete}
    />
  );
};

export { ProcedureDeleteButton };
