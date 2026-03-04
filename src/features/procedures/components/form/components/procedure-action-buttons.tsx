import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, Save } from "lucide-react";
import { ProcedureForEdit } from "@/features/procedures/types/types";

type ProcedureActionButtonsProps = {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isCancelling: boolean;
  isPublishing: boolean;
  procedure: ProcedureForEdit;
  onSave: () => void;
  onPublish: () => void;
  cancelTrigger: React.ReactNode;
  cancelDialog: React.ReactNode;
  onCancelWithoutChanges: () => void;
  discardDraftTrigger?: React.ReactNode;
  discardDraftDialog?: React.ReactNode;
};

export function ProcedureActionButtons({
  hasUnsavedChanges,
  isSaving,
  isCancelling,
  isPublishing,
  procedure,
  onSave,
  onPublish,
  cancelTrigger,
  cancelDialog,
  onCancelWithoutChanges,
  discardDraftTrigger,
  discardDraftDialog,
}: ProcedureActionButtonsProps) {
  const isDraft = procedure.status === "DRAFT";
  return (
    <Card className="p-4 animate-fade-from-top">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 font-medium">
                ● Unsaved changes
              </span>
              <span className="text-muted-foreground text-xs">
                (Save before publishing)
              </span>
            </div>
          )}
          {!hasUnsavedChanges && procedure.pendingVersion && (
            <span className="text-muted-foreground">
              Last saved:{" "}
              {new Date(procedure.pendingVersion.createdAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isDraft &&
          discardDraftTrigger != null &&
          discardDraftDialog != null ? (
            <>
              {discardDraftTrigger}
              {discardDraftDialog}
            </>
          ) : hasUnsavedChanges ? (
            <>
              {cancelTrigger}
              {cancelDialog}
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onCancelWithoutChanges}
              disabled={isCancelling || isSaving || isPublishing}
            >
              {isCancelling ? (
                <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                "Cancel"
              )}
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={onSave}
            disabled={
              isSaving || isCancelling || isPublishing || !hasUnsavedChanges
            }
          >
            {isSaving ? (
              <>
                <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          {procedure.status === "DRAFT" ? <Button
            onClick={onPublish}
            disabled={
              isSaving ||
              isCancelling ||
              isPublishing ||
              hasUnsavedChanges
            }
          >
            {isPublishing ? (
              <>
                <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              </>
            ) : (
              "Publish"
            )}
          </Button> : null}
        </div>
      </div>
    </Card>
  );
}
