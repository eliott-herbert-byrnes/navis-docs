"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCreateInvitation(onSuccessCallback?: () => void) {
  const utils = trpc.useUtils();

  const mutation = trpc.invites.createInvitation.useMutation({
    onSuccess: (data) => {
      utils.invites.getInvites.invalidate();
      toast.success(data.message || "Invite created");
      onSuccessCallback?.();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to create invitation, try again or contact support",
      );
    },
  });

  const createInvitation = (email: string) => {
    mutation.mutate({ email });
  };

  return {
    createInvitation,
    isPending: mutation.isPending,
  };
}

export function useDeleteInvitation(onSuccessCallback?: () => void) {
  const utils = trpc.useUtils();

  const mutation = trpc.invites.deleteInvitation.useMutation({
    onSuccess: (data) => {
      utils.invites.getInvites.invalidate();
      toast.success(data.message || "Invite deleted");
      onSuccessCallback?.();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to delete invitation, try again or contact support",
      );
    },
  });

  const deleteInvitation = (email: string) => {
    mutation.mutate({ email });
  };

  return {
    deleteInvitation,
    isPending: mutation.isPending,
  };
}

export function useAcceptInvitation() {
  const router = useRouter();

  const mutation = trpc.invites.acceptInvitation.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Invite accepted successfully");
      // Redirect to home page
      router.push("/");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to accept invitation, try again or contact support",
      );
    },
  });

  const acceptInvitation = (token: string) => {
    mutation.mutate({ token });
  };

  return {
    acceptInvitation,
    isPending: mutation.isPending,
  };
}
