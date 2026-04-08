"use client";

import { Button } from "@/components/ui/button";
import {
  Edit,
  Share2,
  Loader2,
  FileIcon,
  Brain,
  FileText,
  History,
  Check,
  CircleCheck,
  ChevronDown,
  Calendar,
  FolderOpen,
  Flag,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { editProcedurePath, teamProcedurePath } from "@/app/paths";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProcedureFavoriteButton } from "./favorite/components/procedure-favorite-button";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { ProcedureForViewWithRelations } from "../types/types";
import { hasFlowDocContent } from "../utils/generate-plain-text-from-tiptap";
import { useMarkProcedureRead } from "../hooks/use-procedure-mutations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProcedureBaseDeleteDialog } from "@/features/procedure-base/components/procedure-base-delete-dialog";
import { ProcedureErrorDialog } from "./error/components/procedure-error-dialog";
import { useCreateErrorReport } from "./error/hooks/use-errors-mutations";
import { useDeleteProcedureFromBase } from "@/features/procedure-base/hook/use-procedure-base-mutations";

type ProcedureViewActionsProps = {
  procedureId: string;
  canEdit: boolean;
  isFavorite: boolean;
  isRead: boolean;
  procedure: ProcedureForViewWithRelations;
  onAskAI?: () => void;
  showDocView?: boolean;
  onViewText?: () => void;
  canViewProcedureAudit?: boolean;
  showAuditLogs?: boolean;
  onViewAuditLogs?: () => void;
};

export function ProcedureViewActions({
  procedureId,
  canEdit,
  isFavorite,
  isRead,
  procedure,
  onAskAI,
  showDocView = false,
  onViewText,
  canViewProcedureAudit,
  showAuditLogs = false,
  onViewAuditLogs,
}: ProcedureViewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { departmentId, teamId } = useProcedureRouteContext();
  const { markProcedureRead, isPending: isMarkReadPending } =
    useMarkProcedureRead();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const { createErrorReport, isPending: isErrorPending } = useCreateErrorReport();
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

  const showMarkAsRead = procedure.publishedVersion && !isRead;
  const handleMarkAsRead = () => {
    if (procedure.publishedVersion) {
      markProcedureRead(procedureId, procedure.publishedVersion.id);
    }
  };

  const handleDeleteSuccess = () => {
    router.push(teamProcedurePath(departmentId, teamId));
  };

  const { deleteProcedure, isPending: isDeletePending } =
    useDeleteProcedureFromBase({ onSuccess: handleDeleteSuccess });

  const dropdownButtons = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="shadow">
          Actions <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col p-0 m-0 gap-1">
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit} disabled={isPending} className="px-3 py-2">
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Edit className="w-4 h-4 mr-1" />
            )}
            Edit
          </DropdownMenuItem>
        )}

        {isFlowWithDoc && onViewText && (
          <DropdownMenuItem onClick={onViewText} className="px-3 py-2">
            {showDocView ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <FileText className="w-4 h-4 mr-1" />
            )}
            {showDocView ? "Hide text" : "View text"}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleShare} className="px-3 py-2">
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExport} className="px-3">
          <FileIcon className="w-4 h-4 mr-1" />
          Export
        </DropdownMenuItem>

        {onAskAI && (
          <DropdownMenuItem
            onClick={onAskAI}
            aria-label="Ask AI about this procedure"
            className="px-3 py-2"
          >
            <Brain className="w-4 h-4 mr-1" />
            Ask AI
          </DropdownMenuItem>
        )}

        {canViewProcedureAudit && onViewAuditLogs && (
          <DropdownMenuItem
            onClick={onViewAuditLogs}
            aria-label="View audit logs for this procedure"
            className="px-3 py-2"
          >
            {showAuditLogs ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <History className="w-4 h-4 mr-1" />
            )}
            Audit Logs
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <ProcedureFavoriteButton
            procedureId={procedureId}
            initialIsFavorite={isFavorite}
            showLabel={true}
          />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setErrorDialogOpen(true)}
          className="px-3 py-2"
        >
          <Flag className="w-4 h-4 mr-1" />
          Report
        </DropdownMenuItem>

        {canEdit && (
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="px-3 py-2 text-destructive focus:text-destructive"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const dialogs = (
    <>
      <ProcedureErrorDialog
        title="Report Issue"
        description="Report an issue with this procedure"
        onSubmit={createErrorReport}
        isPending={isErrorPending}
        procedureId={procedureId}
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
      />
      {canEdit && (
        <ProcedureBaseDeleteDialog
          title="Are you sure you want to delete this procedure?"
          description="This action cannot be undone."
          onConfirm={async () => { await deleteProcedure(procedureId); }}
          isPending={isDeletePending}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full">
      <Card className="p-4 animate-fade-from-top shadow-none border">
        <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 text-sm">
            {/* Published Date */}
            <div className="flex items-center gap-2 text-muted-foreground ">
              <Calendar className="w-4 h-4" />
              <span>
                Published{" "}
                {procedure.publishedVersion
                  ? formatDate(procedure.publishedVersion.createdAt)
                  : "Unpublished"}
              </span>
            </div>
            {/* Team/Category Badges */}
          </div>
          <div className="flex flex-row gap-2 sm:ml-4">
          {procedure.category && (
            <Badge variant="outline">
              <FolderOpen className="w-3 h-3 mr-1" />
              {procedure.category.name}
            </Badge>
          )}
          </div>
          {/* Mark as read - show only when published and unread */}
          <div className="flex flex-row items-center gap-2 sm:ml-auto flex-wrap">
            {showMarkAsRead && (
              <Button
              size="sm"
                variant="outline"
                onClick={handleMarkAsRead}
                disabled={isMarkReadPending}
                aria-label="Mark this procedure as read"
                className=""
              >
                {isMarkReadPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CircleCheck className="w-4 h-4 mr-1 animate-pulse" />
                )}
                Mark as read
              </Button>
            )}
            {dropdownButtons}
          </div>
        </div>
      </Card>
      {dialogs}
    </div>
  );
}