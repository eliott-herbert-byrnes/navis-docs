"use client";

import { UserDeleteDialog } from "./user-delete-dialog";
import { useDeleteUser } from "../hooks/use-user-mutations";

const UserDeleteButton = ({ userId }: { userId: string }) => {
  const { deleteUser, isPending } = useDeleteUser();

  const handleDelete = () => {
    deleteUser(userId);
  };

  return (
    <UserDeleteDialog
      title="Are you sure you want to delete this user?"
      description="This action cannot be undone."
      isPending={isPending}
      onConfirm={handleDelete}
    />
  );
};

export { UserDeleteButton };
