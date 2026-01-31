"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  editProcedurePath,
  teamProcedurePath,
  viewProcedurePath,
} from "@/app/paths";

export function useCreateProcedure(departmentId: string, teamId: string) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.procedures.createProcedure.useMutation({
    onSuccess: (data) => {
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      toast.success("Procedure created successfully, redirecting to editor");
      if (data?.data?.id) {
        router.push(editProcedurePath(departmentId, teamId, data.data.id));
      }
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create procedure");
    },
  });

  const createProcedure = (data: {
    procedureTitle: string;
    procedureDescription: string;
    procedureCategoryId?: string;
    newProcedureCategory?: boolean;
    newProcedureCategoryName?: string;
    procedureStyle: "raw" | "steps" | "flow" | "yesno";
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
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      if (data?.data?.id) {
        utils.procedures.getForEdit.invalidate({ procedureId: data.data.id });
      }
      toast.success("Procedure published successfully, redirecting...");
      if (data?.data?.id) {
        router.push(viewProcedurePath(departmentId, teamId, data.data.id));
      }
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish procedure");
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

export function useUpdateProcedureContent() {
  const utils = trpc.useUtils();
  const mutation = trpc.procedures.updateProcedureContent.useMutation({
    onSuccess: (data) => {
      if (data?.data?.id) {
        utils.procedures.getForEdit.invalidate({ procedureId: data.data.id });
      }
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update procedure");
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

export function useDeleteProcedure(departmentId: string, teamId: string) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.procedures.deleteProcedure.useMutation({
    onSuccess: (data) => {
      utils.procedures.list.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      if (data?.data?.id) {
        utils.procedures.getForEdit.invalidate({ procedureId: data.data.id });
      }
      toast.success("Procedure deleted successfully, redirecting...");

      router.push(teamProcedurePath(departmentId, teamId));

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete procedure");
    },
  });

  const deleteProcedure = (procedureId: string) => {
    mutation.mutate({
      procedureId,
    });
  };

  return {
    deleteProcedure,
    isPending: mutation.isPending,
  };
}
