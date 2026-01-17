"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCreateErrorReport() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.errors.createErrorReport.useMutation({
    onSuccess: (data) => {
      utils.errors.getErrors.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create error report");
    },
  });

  const createErrorReport = (data: {
    processId: string;
    errorReport: string;
  }) => {
    mutation.mutate(data);
  };

  return {
    createErrorReport,
    isPending: mutation.isPending,
  };
}

export function useUpdateErrorStatus() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.errors.updateErrorStatus.useMutation({
    onSuccess: (data) => {
      utils.errors.getErrors.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update error report status");
    },
  });

  const updateErrorStatus = (
    errorId: string,
    status: "OPEN" | "RESOLVED" | "ARCHIVED",
  ) => {
    mutation.mutate({
      errorId,
      status,
    });
  };

  return {
    updateErrorStatus,
    isPending: mutation.isPending,
  };
}

export function useDeleteError() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.errors.deleteError.useMutation({
    onSuccess: (data) => {
      utils.errors.getErrors.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete error report");
    },
  });

  const deleteError = (errorId: string) => {
    mutation.mutate({
      errorId,
    });
  };

  return {
    deleteError,
    isPending: mutation.isPending,
  };
}
