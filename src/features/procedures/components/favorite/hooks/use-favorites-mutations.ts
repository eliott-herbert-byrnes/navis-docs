"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useToggleFavorite() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.favorites.toggleFavorite.useMutation({
    onSuccess: (data) => {
      utils.favorites.getFavorites.invalidate();
      utils.procedures.getForView.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle favorite, try again or refresh the page");
    },
  });

  const toggleFavorite = (procedureId: string, isFavorited: boolean) => {
    mutation.mutate({
      procedureId,
      isFavorited,
    });
  };

  return {
    toggleFavorite,
    isPending: mutation.isPending,
  };
}
