"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "../actions/toggle-favorite";
import { toast } from "sonner";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticIsFavorite, setOptimisticIsFavorite] =
    useOptimistic(initialIsFavorite);

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticIsFavorite(!optimisticIsFavorite);

      const result = await toggleFavorite({
        processId,
        isFavorited: optimisticIsFavorite,
      });

      if (result.status === "SUCCESS") {
        toast.success(result.message);
        router.refresh();
      } else {
        setOptimisticIsFavorite(optimisticIsFavorite);
        toast.error(result.message || "Failed to toggle favorite");
      }
    });
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
