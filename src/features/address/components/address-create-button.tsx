"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { createAddress } from "../actions/address-create";
import { AddressCreateDialog } from "./address-create-dialog";

const AddressCreateButton = () => {
  const [actionState, action] = useActionState(
    createAddress,
    EMPTY_ACTION_STATE
  );

  return (
    <AddressCreateDialog
      title="Add New Address"
      description="Create a new address entry"
      action={action}
      actionState={actionState}
    />
  );
};

export { AddressCreateButton };

