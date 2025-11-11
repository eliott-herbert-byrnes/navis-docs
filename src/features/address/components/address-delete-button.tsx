"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { AddressDeleteDialog } from "./address-delete-dialog";
import { deleteAddress } from "../actions/address-delete";

const AddressDeleteButton = ({ addressId }: { addressId: string }) => {
  const [actionState, action] = useActionState(
    deleteAddress,
    EMPTY_ACTION_STATE
  );

  return (
    <AddressDeleteDialog
      title="Are you sure you want to delete this address?"
      description="This action cannot be undone."
      action={action}
      actionState={actionState}
      addressId={addressId}
    />
  );
};

export { AddressDeleteButton };