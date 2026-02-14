"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCreateIdea() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.ideas.createIdea.useMutation({
    onSuccess: (data) => {
      utils.ideas.getIdeas.invalidate();
      utils.ideas.getOrgIdeas.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to create idea, try again or contact support",
      );
    },
  });

  const createIdea = (data: {
    teamId: string;
    ideaTitle: string;
    ideaBody: string;
  }) => {
    mutation.mutate(data);
  };

  return {
    createIdea,
    isPending: mutation.isPending,
  };
}

export function useUpdateIdeaStatus() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.ideas.updateIdeaStatus.useMutation({
    onSuccess: (data) => {
      utils.ideas.getIdeas.invalidate();
      utils.ideas.getOrgIdeas.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to update idea status, try again or contact support",
      );
    },
  });

  const updateIdeaStatus = (
    ideaId: string,
    status: "NEW" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED",
  ) => {
    mutation.mutate({
      ideaId,
      status,
    });
  };

  return {
    updateIdeaStatus,
    isPending: mutation.isPending,
  };
}

export function useDeleteIdea() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.ideas.deleteIdea.useMutation({
    onSuccess: (data) => {
      utils.ideas.getIdeas.invalidate();
      utils.ideas.getOrgIdeas.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to delete idea, try again or contact support",
      );
    },
  });

  const deleteIdea = (ideaId: string) => {
    mutation.mutate({
      ideaId,
    });
  };

  return {
    deleteIdea,
    isPending: mutation.isPending,
  };
}
