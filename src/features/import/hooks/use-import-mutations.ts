"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useImportMutations() {
  const startImportMutation = trpc.ingestion.startImport.useMutation({
    onSuccess: () => {
      toast.success("Import started");
    },
    onError: (error) => {
      toast.error(
        error.message ?? "Failed to start import, try again or contact support"
      );
    },
  });

  const approveImportMutation = trpc.ingestion.approveImport.useMutation({
    onSuccess: () => {
      toast.success("Procedure successfully imported");
    },
    onError: (error) => {
      toast.error(
        error.message ?? "Failed to import procedure, please try again."
      );
    },
  });

  const rejectImportMutation = trpc.ingestion.rejectImport.useMutation({
    onSuccess: () => {
      toast.success("Import cancelled");
    },
    onError: (error) => {
      toast.error(
        error.message ?? "Failed to cancel import, please try again."
      );
    },
  });

  return {
    startImportMutation,
    approveImportMutation,
    rejectImportMutation,
  };
}