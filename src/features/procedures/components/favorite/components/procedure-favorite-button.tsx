"use client";

import { useOptimistic, useTransition } from "react";
import { useToggleFavorite } from "../hooks/use-favorites-mutations";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";

type ProcedureFavoriteButtonProps = {
  procedureId: string;
  initialIsFavorite: boolean;
  showLabel?: boolean;
};

export function ProcedureFavoriteButton({
  procedureId,
  initialIsFavorite,
  showLabel = false,
}: ProcedureFavoriteButtonProps) {
  const { toggleFavorite, isPending } = useToggleFavorite();
  const [optimisticIsFavorite, setOptimisticIsFavorite] =
    useOptimistic(initialIsFavorite);
  const [, startTransition] = useTransition();


  const handleToggle = () => {
    startTransition(() => {
      setOptimisticIsFavorite(!optimisticIsFavorite);
    });

    toggleFavorite(procedureId, optimisticIsFavorite);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleToggle}
      disabled={isPending}
      className="rounded-none justify-start hover:bg-accent/0"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star
          className={`w-4 h-4 ${optimisticIsFavorite ? "fill-brand text-brand" : ""}`}
        />
      )}
      {showLabel && (
        <span className="ml-1 font-normal">
          {optimisticIsFavorite ? "Unfavorite" : "Favorite"}
        </span>
      )}
    </Button>
  );
}