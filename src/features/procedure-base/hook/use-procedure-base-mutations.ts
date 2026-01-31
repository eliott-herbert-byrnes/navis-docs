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
      toast.error(error.message || "Failed to delete procedure");
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
