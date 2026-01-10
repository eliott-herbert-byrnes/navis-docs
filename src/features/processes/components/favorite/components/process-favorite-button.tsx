"use client";

import { useOptimistic, useTransition } from "react";
import { useToggleFavorite } from "../hooks/use-favorites-mutations";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";

type ProcessFavoriteButtonProps = {
  processId: string;
  initialIsFavorite: boolean;
  showLabel?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
};

export function ProcessFavoriteButton({
  processId,
  initialIsFavorite,
  showLabel = false,
  size = "sm",
}: ProcessFavoriteButtonProps) {
  const { toggleFavorite, isPending } = useToggleFavorite();
  const [optimisticIsFavorite, setOptimisticIsFavorite] =
    useOptimistic(initialIsFavorite);
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      setOptimisticIsFavorite(!optimisticIsFavorite);
    });

    toggleFavorite(processId, optimisticIsFavorite);
  };

  return (
    <Button
      variant={optimisticIsFavorite ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={
        optimisticIsFavorite ? "bg-yellow-500 hover:bg-yellow-600" : ""
      }
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star
          className={`w-4 h-4 ${optimisticIsFavorite ? "fill-current" : ""}`}
        />
      )}
      {showLabel && (
        <span className="ml-2">
          {optimisticIsFavorite ? "Unfavorite" : "Favorite"}
        </span>
      )}
    </Button>
  );
}
