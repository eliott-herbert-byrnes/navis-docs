"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { UserRoleChangeDialog } from "./user-role-change-dialog";
import { changeUserRole } from "../actions/user-change-role";

const UserRoleChangeButton = ({ userId }: { userId: string }) => {
  const [actionState, action] = useActionState(
    changeUserRole,
    EMPTY_ACTION_STATE
  );

  return (
    <UserRoleChangeDialog
      title="Are you sure you want to change the role of this user?"
      description="Changing a user's role will affect their access permissions within the organization."
      action={action}
      actionState={actionState}
      userId={userId}
    />
  );
};

export { UserRoleChangeButton };
