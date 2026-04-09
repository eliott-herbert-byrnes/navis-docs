"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  editProcedurePath,
  teamProcedurePath,
  viewProcedurePath,
} from "@/app/paths";
import { RolloutRoleFilter } from "@prisma/client";

type CreateProcedureOptions = {
  redirectOnSuccess?: boolean; 
  onSuccess?: () => void;    
};

export function useCreateProcedure(departmentId: string, teamId: string, options?: CreateProcedureOptions) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.procedures.createProcedure.useMutation({
    onSuccess: (data) => {
      utils.sidebar.getSidebarData.invalidate();
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      if (data?.data?.id) {
        if (options?.redirectOnSuccess !== false) {
          toast.success("Procedure created successfully, redirecting to editor");
          router.push(editProcedurePath(departmentId, teamId, data.data.id));
        } else {
          utils.procedures.getProceduresForBase.invalidate();
          toast.success("Procedure created successfully");
          options?.onSuccess?.();
        }
      }
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to create procedure, try again or contact support",
      );
    },
  });

  const createProcedure = (data: {
    procedureTitle: string;
    procedureDescription: string;
    procedureCategoryId?: string;
    newProcedureCategory?: boolean;
    newProcedureCategoryName?: string;
    procedureStyle: "raw" | "steps" | "flow" | "yesno";
    notifyOnPublish?: boolean;
    notifyRoleFilter?: RolloutRoleFilter | null;
    emailOnPublish?: boolean;
    emailRoleFilter?: RolloutRoleFilter | null;
    newsOnPublish?: boolean;
  }) => {
    mutation.mutate({
      departmentId,
      teamId,
      ...data,
    });
  };

  return {
    createProcedure,
    isPending: mutation.isPending,
  };
}

export function usePublishProcedure(departmentId: string, teamId: string) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.procedures.publishProcedure.useMutation({
    onSuccess: (data) => {
      utils.sidebar.getSidebarData.invalidate();
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      utils.procedures.getForView.invalidate();
      utils.procedures.getOutstandingForCurrentUser.invalidate();
      if (data?.data?.id) {
        utils.procedures.getForEdit.invalidate({ procedureId: data.data.id });
      }
      toast.success("Procedure published successfully, redirecting...");
      if (data?.data?.id) {
        router.push(viewProcedurePath(departmentId, teamId, data.data.id));
      }
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to publish procedure, try again or contact support",
      );
    },
  });

  const publishProcedure = (procedureId: string) => {
    mutation.mutate({
      procedureId,
    });
  };

  return {
    publishProcedure,
    isPending: mutation.isPending,
  };
}

export function useMarkProcedureRead() {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.procedures.markProcedureRead.useMutation({
    onSuccess: (_data, variables) => {
      utils.sidebar.getSidebarData.invalidate();
      utils.procedures.getForView.invalidate({
        procedureId: variables.procedureId,
      });
      utils.procedures.getOutstandingForCurrentUser.invalidate();
      toast.success("Marked as read");
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message ?? "Failed to mark procedure as read, try again",
      );
    },
  });

  const markProcedureRead = (procedureId: string, versionId: string) => {
    mutation.mutate({ procedureId, versionId });
  };

  return {
    markProcedureRead,
    isPending: mutation.isPending,
  };
}

export function useUpdateProcedureContent() {
  const utils = trpc.useUtils();
  const mutation = trpc.procedures.updateProcedureContent.useMutation({
    onSuccess: (data) => {
      utils.sidebar.getSidebarData.invalidate();
      if (data?.data?.id) {
        utils.procedures.getForEdit.invalidate({ procedureId: data.data.id });
      }
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to update procedure, try again or contact support",
      );
    },
  });

  const updateProcedureContent = (
    procedureId: string,
    versionId: string,
    contentJSON: unknown,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      silent?: boolean;
    },
  ) => {
    mutation.mutate(
      {
        procedureId,
        versionId,
        contentJSON,
      },
      {
        onSuccess: () => {
          if (!options?.silent) {
            toast.success("Changes saved successfully");
          }
          options?.onSuccess?.();
        },
        onError: (error) => {
          options?.onError?.(error as unknown as Error);
        },
      },
    );
  };

  return {
    updateProcedureContent,
    isPending: mutation.isPending,
  };
}

export function useUpdateProcedureDetails() {
  const utils = trpc.useUtils();
  const mutation = trpc.procedures.updateProcedureDetails.useMutation({
    onSuccess: (data) => {
      utils.sidebar.getSidebarData.invalidate();
      if (data?.data?.id) {
        utils.procedures.getForEdit.invalidate({ procedureId: data.data.id });
        utils.procedures.getForView.invalidate({ procedureId: data.data.id });
      }
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to update procedure details, try again or contact support",
      );
    },
  });

  const updateProcedureDetails = (
    input: {
      procedureId: string;
      procedureTitle: string;
      procedureDescription: string;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      silent?: boolean;
    },
  ) => {
    mutation.mutate(input, {
      onSuccess: () => {
        if (!options?.silent) {
          toast.success("Procedure details updated");
        }
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error as unknown as Error);
      },
    });
  };

  return {
    updateProcedureDetails,
    isPending: mutation.isPending,
  };
}

export function useDeleteProcedure(departmentId: string, teamId: string) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.procedures.deleteProcedure.useMutation({
    onSuccess: (data) => {
      utils.sidebar.getSidebarData.invalidate();
      utils.procedures.list.invalidate();
      utils.favorites.getFavorites.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      if (data?.data?.id) {
        utils.procedures.getForEdit.invalidate({ procedureId: data.data.id });
      }
      toast.success("Procedure deleted successfully, redirecting...");

      router.push(teamProcedurePath(departmentId, teamId));
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to delete procedure, try again or contact support",
      );
    },
  });

  const deleteProcedure = (procedureId: string) => {
    mutation.mutate({
      procedureId,
    });
  };

  const deleteProcedureAsync = (procedureId: string) =>
    mutation.mutateAsync({ procedureId });

  return {
    deleteProcedure,
    deleteProcedureAsync,
    isPending: mutation.isPending,
  };
}
