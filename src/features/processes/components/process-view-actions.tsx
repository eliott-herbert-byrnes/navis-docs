"use client";

import { Button } from "@/components/ui/button";
import { Edit, Printer, Share2, Flag, Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { editProcessPath } from "@/app/paths";
import { toast } from "sonner";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { ProcessFavoriteButton } from "./favorite/components/process-favorite-button";

type ProcessViewActionsProps = {
  departmentId: string;
  teamId: string;
  processId: string;
  canEdit: boolean;
  isFavorite: boolean;
};

export function ProcessViewActions({
  departmentId,
  teamId,
  processId,
  canEdit,
  isFavorite,
}: ProcessViewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEdit = () => {
    startTransition(() => {
      router.push(editProcessPath(departmentId, teamId, processId));
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleReport = () => {
    toast.info("Report functionality coming soon");
  };

  const handleFavourite = () => {
    toast.info("Favourite functionality coming soon");
  };

  return (
    <div className="flex gap-2">
      {/* Desktop Actions */}
      <div className="hidden md:flex gap-2">
        {canEdit && (
          <Button onClick={handleEdit} size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Edit className="w-4 h-4 mr-2" />
            )}
            Edit
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <ProcessFavoriteButton
          processId={processId}
          initialIsFavorite={isFavorite}
          size="sm"
        />
        <Button variant="outline" size="sm" onClick={handleReport}>
          <Flag className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile Actions - Dropdown */}
      <div className="md:hidden">
        {canEdit && (
          <Button
            onClick={handleEdit}
            size="sm"
            className="mr-2"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Edit className="w-4 h-4 mr-2" />
            )}
            Edit
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ProcessFavoriteButton
                processId={processId}
                initialIsFavorite={isFavorite}
                showLabel={true}
                size="sm"
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReport}>
              <Flag className="w-4 h-4 mr-2" />
              Report Issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
