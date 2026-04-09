"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useToggleFavorite() {
  const utils = trpc.useUtils();

  const mutation = trpc.favorites.toggleFavorite.useMutation({
    onSuccess: (data) => {
      utils.sidebar.getSidebarData.invalidate();
      utils.favorites.getFavorites.invalidate();
      utils.procedures.getForView.invalidate();

      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to toggle favorite, try again or refresh the page",
      );
    },
  });

  const toggleFavorite = (
    procedureId: string,
    isFavorited: boolean,
    onError?: () => void,
  ) => {
    mutation.mutate({ procedureId, isFavorited }, { onError });
  };

  return {
    toggleFavorite,
    isPending: mutation.isPending,
  };
}
