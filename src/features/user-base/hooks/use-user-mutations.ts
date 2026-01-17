"use client";

import { trpc } from "@/trpc/client";
import { OrgMembershipRole } from "@prisma/client";
import { toast } from "sonner";

export function useDeleteUser() {
  const utils = trpc.useUtils();
  const mutation = trpc.users.deleteUser.useMutation({
    onSuccess: () => {
      utils.users.getOrgMembers.invalidate();
      toast.success("User deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const deleteUser = (userId: string) => {
    mutation.mutate({
      userId,
    });
  };

  return {
    deleteUser,
    isPending: mutation.isPending,
  };
}

export function useChangeRole() {
  const utils = trpc.useUtils();
  const mutation = trpc.users.changeUserRole.useMutation({
    onSuccess: () => {
      utils.users.getOrgMembers.invalidate();
      toast.success("User role changed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change user role");
    },
  });

  const changeUserRole = (userId: string, role: OrgMembershipRole) => {
    mutation.mutate({
      userId,
      role,
    });
  };

  return {
    changeUserRole,
    isPending: mutation.isPending,
  };
}
