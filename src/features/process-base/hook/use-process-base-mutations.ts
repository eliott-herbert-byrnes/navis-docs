"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useDeleteProcessFromBase() {
  const utils = trpc.useUtils();

  const mutation = trpc.process.deleteProcess.useMutation({
    onSuccess: () => {
      utils.process.getProcessesForBase.invalidate();
      toast.success("Process deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete process");
    },
  });

  const deleteProcess = (processId: string) => {
    mutation.mutate({ processId });
  };

  return {
    deleteProcess,
    isPending: mutation.isPending,
  };
}
