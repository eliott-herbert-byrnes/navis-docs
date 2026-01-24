"use client";

import { useDeleteAddress } from "../hook/use-address-mutations";
import { AddressDeleteDialog } from "./address-delete-dialog";

const AddressDeleteButton = ({ addressId }: { addressId: string }) => {
  const { deleteAddress, isPending } = useDeleteAddress();

  const handleDelete = () => {
    deleteAddress(addressId);
  };

  return (
    <AddressDeleteDialog
      title="Are you sure you want to delete this address?"
      description="This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

export { AddressDeleteButton };
