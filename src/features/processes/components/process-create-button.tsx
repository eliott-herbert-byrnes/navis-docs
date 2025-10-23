"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { ProcessDialog } from "./process-create-dialog";
import { createProcess } from "../actions/create-process";

const ProcessCreateButton = ({ isAdmin }: { isAdmin: boolean }) => {
  const [actionState, action] = useActionState(
    createProcess,
    EMPTY_ACTION_STATE
  );

  return (
    <ProcessDialog
      title="Create Process"
      description="Create a new process and add a category"
      action={action}
      actionState={actionState}
      disabled={!isAdmin}
    />
  );
};

export { ProcessCreateButton };
