"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useDeleteProcedureFromBase() {
  const utils = trpc.useUtils();

  const mutation = trpc.procedures.deleteProcedure.useMutation({
    onSuccess: () => {
      utils.procedures.getProceduresForBase.invalidate();
      toast.success("Procedure deleted");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to delete procedure, try again or contact support",
      );
    },
  });

  const deleteProcedure = (procedureId: string) => {
    mutation.mutate({ procedureId });
  };

  return {
    deleteProcedure,
    isPending: mutation.isPending,
  };
}

export function useDeleteProceduresFromBase() {
  const utils = trpc.useUtils();

  const mutation = trpc.procedures.deleteProcedures.useMutation({
    onSuccess: (data) => {
      utils.procedures.getProceduresForBase.invalidate();
      const count = data?.data?.deletedCount ?? 0;
      toast.success(
        count === 1 ? "Procedure deleted" : `${count} procedures deleted`,
      );
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to delete procedures, try again or contact support",
      );
    },
  });

  const deleteProcedures = (procedureIds: string[]) => {
    mutation.mutate({ procedureIds });
  };

  return {
    deleteProcedures,
    isPending: mutation.isPending,
  };
}

export function useUpdateProcedureCategory() {
  const utils = trpc.useUtils();

  const mutation = trpc.procedures.updateProcedureCategory.useMutation({
    onSuccess: () => {
      utils.procedures.getProceduresForBase.invalidate();
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error(
        error.message ??
          "Failed to update category, try again or contact support",
      );
    },
  });

  const updateCategory = (procedureId: string, categoryId: string | null) => {
    mutation.mutate({ procedureId, categoryId });
  };

  return {
    updateCategory,
    isPending: mutation.isPending,
  };
}
