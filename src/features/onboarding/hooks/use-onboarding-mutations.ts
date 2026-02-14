"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { homePath } from "@/app/paths";

export function useCreateOrganization() {
  const router = useRouter();
  const mutation = trpc.organization.createOrganization.useMutation({
    onSuccess: () => {
      toast.success("Organization created successfully");
      router.replace(homePath());
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to create organization, try again or contact support",
      );
    },
  });

  const createOrganization = (name: string) => {
    mutation.mutate({ name });
  };

  return {
    createOrganization,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
