"use client";

import { ProcedureErrorDialog } from "./procedure-error-dialog";
import { useCreateErrorReport } from "../hooks/use-errors-mutations";

export const ProcedureErrorButton = ({
  procedureId,
}: {
  procedureId: string;
}) => {
  const { createErrorReport, isPending } = useCreateErrorReport();

  return (
    <ProcedureErrorDialog
      title="Report Issue"
      description="Report an issue with this procedure"
      onSubmit={createErrorReport}
      isPending={isPending}
      procedureId={procedureId}
    />
  );
};
