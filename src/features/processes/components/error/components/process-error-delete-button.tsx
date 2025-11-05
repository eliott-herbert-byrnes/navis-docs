"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { deleteError } from "../actions/delete-error";
import { ProcessErrorDeleteDialog } from "./process-error-delete-dialog";


const ProcessErrorDeleteButton = ({ errorId }: { errorId: string }) => {
    const [actionState, action] = useActionState(       
        deleteError,
        EMPTY_ACTION_STATE,
    );

    return (
        <ProcessErrorDeleteDialog 
        title="Are you sure you want to delete this error report?"
        description="This action cannot be undone."
        action={action}
        actionState={actionState}
        errorId={errorId}
        />
    );
};

export { ProcessErrorDeleteButton };