"use client";

import { AddressCreateDialog } from "./address-create-dialog";

const AddressCreateButton = ({ isAdmin }: { isAdmin: boolean }) => {
  return (
    <AddressCreateDialog
      title="Add New Address"
      description="Create a new address entry"
      isAdmin={isAdmin}
    />
  );
};

export { AddressCreateButton };
