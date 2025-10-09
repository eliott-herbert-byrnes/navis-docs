"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { DepartmentDialog } from "./department-create-dialog";
import { createDepartment } from "../../actions/create-department";

const DepartmentCreateButton = () => {
  const [actionState, action] = useActionState(
    createDepartment,
    EMPTY_ACTION_STATE
  );

  return (
    <DepartmentDialog
      title="Create Department"
      description="Create a new department and add teams"
      action={action}
      actionState={actionState}
      disabled={actionState.payload?.get("isAdmin") === "false"}
    />
  );
};

export { DepartmentCreateButton };
