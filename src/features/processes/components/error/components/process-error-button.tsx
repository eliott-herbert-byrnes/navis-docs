"use client";

import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { ProcessErrorDialog } from "./process-error-dialog";
import { createErrorReport } from "../actions/create-error-report";

export const ProcessErrorButton = ({ processId }: { processId: string }) => {
    const [actionState, action] = useActionState(
        createErrorReport,
        EMPTY_ACTION_STATE,
    );

    return (
        <ProcessErrorDialog
        title="Report Issue"
        description="Report an issue with this process"
        action={action}
        actionState={actionState}
        processId={processId}
        />
    )
}

