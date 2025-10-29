import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle, Save } from "lucide-react";
import { ProcessForEdit } from "../../../queries/get-process-for-edit";

type ProcessActionButtonsProps = {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isCancelling: boolean;
  isPublishing: boolean;
  process: ProcessForEdit;
  onSave: () => void;
  onPublish: () => void;
  cancelTrigger: React.ReactNode;
  cancelDialog: React.ReactNode;
  onCancelWithoutChanges: () => void;
};

export function ProcessActionButtons({
  hasUnsavedChanges,
  isSaving,
  isCancelling,
  isPublishing,
  process,
  onSave,
  onPublish,
  cancelTrigger,
  cancelDialog,
  onCancelWithoutChanges,
}: ProcessActionButtonsProps) {
  return (
    <Card className="p-4">
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
          {!hasUnsavedChanges && process.pendingVersion && (
            <span className="text-muted-foreground">
              Last saved:{" "}
              {new Date(process.pendingVersion.createdAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {hasUnsavedChanges ? (
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
                Save Draft
              </>
            )}
          </Button>
          <Button
            onClick={onPublish}
            disabled={
              isSaving ||
              isCancelling ||
              isPublishing ||
              hasUnsavedChanges ||
              process.status === "PUBLISHED"
            }
          >
            {isPublishing ? (
              <>
                <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

