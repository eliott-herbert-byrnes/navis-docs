"use client";

import { Button } from "@/components/ui/button";
import { Edit, Share2, Loader2, FileIcon, Brain, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { editProcedurePath } from "@/app/paths";
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
import { ProcedureFavoriteButton } from "./favorite/components/procedure-favorite-button";
import { ProcedureErrorButton } from "./error/components/procedure-error-button";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { ProcedureForViewWithRelations } from "../types/types";
import { hasFlowDocContent } from "../utils/generate-plain-text-from-tiptap";

type ProcedureViewActionsProps = {
  procedureId: string;
  canEdit: boolean;
  isFavorite: boolean;
  procedure: ProcedureForViewWithRelations;
  onAskAI?: () => void;
  /** When FLOW has doc, toggles doc visibility (side-by-side / Text tab). */
  showDocView?: boolean;
  onViewText?: () => void;
};

export function ProcedureViewActions({
  procedureId,
  canEdit,
  isFavorite,
  procedure,
  onAskAI,
  showDocView = false,
  onViewText,
}: ProcedureViewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { departmentId, teamId } = useProcedureRouteContext();
  const isFlowWithDoc =
    procedure.style === "FLOW" &&
    hasFlowDocContent(procedure.publishedVersion?.contentJSON);

  const handleEdit = () => {
    startTransition(() => {
      router.push(editProcedurePath(departmentId, teamId, procedureId));
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy link, check permissions or try again");
    }
  };

  // Generate JSON export format
  const generateJSON = () => {
    return JSON.stringify(
      {
        id: procedure.id,
        title: procedure.title,
        description: procedure.description,
        category: procedure.category?.name,
        team: procedure.team?.name,
        createdAt: procedure.publishedVersion?.createdAt,
        content: procedure.publishedVersion?.contentJSON,
      },
      null,
      2,
    );
  };

  // Copy to clipboard with toast notification
  const handleExport = async () => {
    try {
      const content = generateJSON();
      await navigator.clipboard.writeText(content);
      toast.success(`Copied as JSON`);
    } catch (error) {
      toast.error(
        "Failed to copy to clipboard, check permissions or try again",
      );
    }
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
        {isFlowWithDoc && onViewText && (
          <Button
            variant={showDocView ? "default" : "outline"}
            size="sm"
            onClick={onViewText}
          >
            <FileText className="w-4 h-4 mr-2" />
            {showDocView ? "Hide text" : "View text"}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileIcon className="w-4 h-4 mr-2" />
          Export
        </Button>
        {onAskAI && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAskAI}
            aria-label="Ask AI about this procedure"
          >
            <Brain className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
        )}
        <ProcedureFavoriteButton
          procedureId={procedureId}
          initialIsFavorite={isFavorite}
          size="sm"
        />
        <ProcedureErrorButton procedureId={procedureId} />
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
            {isFlowWithDoc && onViewText && (
              <DropdownMenuItem onClick={onViewText}>
                <FileText className="w-4 h-4 mr-2" />
                {showDocView ? "Hide text" : "View text"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            {onAskAI && (
              <DropdownMenuItem
                onClick={onAskAI}
                aria-label="Ask AI about this procedure"
              >
                <Brain className="w-4 h-4 mr-2" />
                Ask AI
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ProcedureFavoriteButton
                procedureId={procedureId}
                initialIsFavorite={isFavorite}
                showLabel={true}
                size="sm"
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ProcedureErrorButton procedureId={procedureId} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
