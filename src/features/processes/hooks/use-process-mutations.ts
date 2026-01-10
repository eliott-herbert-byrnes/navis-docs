"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { editProcessPath, teamProcessPath, viewProcessPath } from "@/app/paths";

export function useCreateProcess(departmentId: string, teamId: string) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.process.createProcess.useMutation({
    onSuccess: (data) => {
      utils.process.list.invalidate();
      utils.process.categoriesWithProcesses.invalidate();
      toast.success("Process created successfully, redirecting to editor");
      if (data?.data?.id) {
        router.push(editProcessPath(departmentId, teamId, data.data.id));
      }
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create process");
    },
  });

  const createProcess = (data: {
    processTitle: string;
    processDescription: string;
    processCategoryId?: string;
    newProcessCategory?: boolean;
    newProcessCategoryName?: string;
    processStyle: "raw" | "steps" | "flow" | "yesno";
  }) => {
    mutation.mutate({
      departmentId,
      teamId,
      ...data,
    });
  };

  return {
    createProcess,
    isPending: mutation.isPending,
  };
}

export function usePublishProcess(departmentId: string, teamId: string) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.process.publishProcess.useMutation({
    onSuccess: (data) => {
      utils.process.list.invalidate();
      utils.process.categoriesWithProcesses.invalidate();
      if (data?.data?.id) {
        utils.process.getForEdit.invalidate({ processId: data.data.id });
      }
      toast.success("Process published successfully, redirecting...");
      if (data?.data?.id) {
        router.push(viewProcessPath(departmentId, teamId, data.data.id));
      }
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish process");
    },
  });

  const publishProcess = (processId: string) => {
    mutation.mutate({
      processId,
    });
  };

  return {
    publishProcess,
    isPending: mutation.isPending,
  };
}

export function useUpdateProcessContent(
) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.process.updateProcessContent.useMutation({
    onSuccess: (data) => {
      if (data?.data?.id) {
        utils.process.getForEdit.invalidate({ processId: data.data.id });
      }
      utils.process.list.invalidate();
      utils.process.categoriesWithProcesses.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update process");
    },
  });

  const updateProcessContent = (
    processId: string,
    versionId: string,
    contentJSON: unknown,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      silent?: boolean;
    }
  ) => {
    mutation.mutate(
      {
        processId,
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
      }
    );
  };

  return {
    updateProcessContent,
    isPending: mutation.isPending,
  };
}

export function useDeleteProcess(departmentId: string, teamId: string) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.process.deleteProcess.useMutation({
    onSuccess: (data) => {
      utils.process.list.invalidate();
      utils.process.categoriesWithProcesses.invalidate();
      if (data?.data?.id) {
        utils.process.getForEdit.invalidate({ processId: data.data.id });
      }
      toast.success("Process deleted successfully, redirecting...");

      router.push(teamProcessPath(departmentId, teamId));

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete process");
    },
  });

  const deleteProcess = (processId: string) => {
    mutation.mutate({
      processId,
    });
  };

  return {
    deleteProcess,
    isPending: mutation.isPending,
  };
}
