import { signInPath } from "@/app/paths";
import { trpc } from "@/trpc/client";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteOrg() {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);

  const mutation = trpc.organization.deleteOrganization.useMutation({
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      setOpen(false);
      redirect(signInPath());
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to delete organization, try again or contact support",
      );
    },
  });

  const deleteOrganization = () => {
    mutation.mutate();
  };

  return {
    open,
    setOpen,
    deleteOrganization,
    isPending: mutation.isPending,
  };
}
