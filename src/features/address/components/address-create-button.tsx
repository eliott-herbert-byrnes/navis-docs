"use client";

import { AddressCreateDialog } from "./address-create-dialog";

const AddressCreateButton = () => {
  return (
    <AddressCreateDialog
      title="Add New Address"
      description="Create a new address entry"
    />
  );
};

export { AddressCreateButton };
