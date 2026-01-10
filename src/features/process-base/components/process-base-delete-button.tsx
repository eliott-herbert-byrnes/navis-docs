"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { ProcessBaseDeleteDialog } from "./process-base-delete-dialog";
import { deleteProcessFromBase } from "../actions/process-delete-from-base";

const ProcessBaseDeleteButton = ({ processId }: { processId: string }) => {
  const [actionState, action] = useActionState(
    deleteProcessFromBase,
    EMPTY_ACTION_STATE
  );

  return (
    <ProcessBaseDeleteDialog
      title="Are you sure you want to delete this process?"
      description="This action cannot be undone."
      action={action}
      actionState={actionState}
      processId={processId}
    />
  );
};

export { ProcessBaseDeleteButton };
