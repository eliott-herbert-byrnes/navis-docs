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
      utils.process.getForView.invalidate();

      toast.success(data.message);

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle favorite");
    },
  });

  const toggleFavorite = (processId: string, isFavorited: boolean) => {
    mutation.mutate({
      processId,
      isFavorited,
    });
  };

  return {
    toggleFavorite,
    isPending: mutation.isPending,
  };
}
