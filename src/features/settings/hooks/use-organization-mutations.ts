"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useRenameOrganization() {
  const router = useRouter();
  const mutation = trpc.organization.renameOrganization.useMutation({
    onSuccess: () => {
      toast.success("Organization name updated");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to rename organization, try again or contact support");
    },
  });

  const renameOrganization = (data: { orgId: string; orgName: string }) => {
    mutation.mutate({
      ...data,
    });
  };

  return {
    renameOrganization,
    isLoading: mutation.isPending,
  };
}
