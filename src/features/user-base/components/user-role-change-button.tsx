"use client";

import { OrgMembershipRole } from "@prisma/client";
import { useChangeRole } from "../hooks/use-user-mutations";
import { UserRoleChangeDialog } from "./user-role-change-dialog";

const UserRoleChangeButton = ({
  userId,
  role,
}: {
  userId: string;
  role: OrgMembershipRole;
}) => {
  const { changeUserRole, isPending } = useChangeRole();

  const handleDelete = (newRole: OrgMembershipRole) => {
    changeUserRole(userId, newRole);
  };

  return (
    <UserRoleChangeDialog
      title="Are you sure you want to change the role of this user?"
      description="Changing a user's role will affect their access permissions within the organization."
      currentRole={role}
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

export { UserRoleChangeButton };
