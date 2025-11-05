"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { UserDeleteDialog } from "./user-delete-dialog";
import { deleteUserFromBase } from "../actions/user-delete-from-base";

const UserDeleteButton = ({ userId }: { userId: string }) => {
  const [actionState, action] = useActionState(
    deleteUserFromBase,
    EMPTY_ACTION_STATE
  );

  return (
    <UserDeleteDialog
      title="Are you sure you want to delete this user?"
      description="This action cannot be undone."
      action={action}
      actionState={actionState}
      userId={userId}
    />
  );
};

export { UserDeleteButton };
