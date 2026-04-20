"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useAiConfiguration() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const statusQuery = trpc.organization.getAiKeyStatus.useQuery(undefined, {
    retry: false,
  });

  const saveMutation = trpc.organization.saveAiKeys.useMutation({
    onSuccess: (result) => {
      if (result.updated) {
        toast.success("AI API keys updated");
      } else {
        toast.message("No changes", {
          description: "Enter a new key to replace an existing one.",
        });
      }
      void utils.organization.getAiKeyStatus.invalidate();
      void utils.organization.getAiAvailability.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Could not save API keys, try again or contact support",
      );
    },
  });

  const removeMutation = trpc.organization.removeAiKeys.useMutation({
    onSuccess: (result) => {
      if (result.removed) {
        toast.success("API key removed");
      }
      void utils.organization.getAiKeyStatus.invalidate();
      void utils.organization.getAiAvailability.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Could not remove API key, try again or contact support",
      );
    },
  });

  return {
    statusQuery,
    saveMutation,
    removeMutation,
  };
}
