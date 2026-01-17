"use client";

import { ProcessErrorDialog } from "./process-error-dialog";
import { useCreateErrorReport } from "../hooks/use-errors-mutations";

export const ProcessErrorButton = ({ processId }: { processId: string }) => {
  const { createErrorReport, isPending } = useCreateErrorReport();

  return (
    <ProcessErrorDialog
      title="Report Issue"
      description="Report an issue with this process"
      onSubmit={createErrorReport}
      isPending={isPending}
      processId={processId}
    />
  );
};
