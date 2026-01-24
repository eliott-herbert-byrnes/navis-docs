"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback, useEffect } from "react";
import { teamProcessPath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle } from "lucide-react";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { ProcessHeader } from "./form/components/process-header";
import { ProcessActionButtons } from "./form/components/process-action-buttons";
import { ProcessEditorSelector } from "./form/components/process-editor-selector";
import {
  ProcessContent,
  handleSaveProcess,
  handlePublishProcess,
  handleCancelEdit,
} from "./form/utils/process-edit-utils";
import { ProcessForEdit } from "../types/types";
import {
  usePublishProcess,
  useUpdateProcessContent,
} from "../hooks/use-process-mutations";

type EditProcessFormProps = {
  departmentId: string;
  teamId: string;
  processId: string;
  process: ProcessForEdit;
};

export const EditProcessForm = ({
  departmentId,
  teamId,
  processId,
  process,
}: EditProcessFormProps) => {
  const router = useRouter();
  const [isCancelling, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const initialContent: ProcessContent =
    (process.pendingVersion?.contentJSON as ProcessContent) ||
    (process.publishedVersion?.contentJSON as ProcessContent) ||
    ({} as ProcessContent);

  const [content, setContent] = useState<ProcessContent>(initialContent);

  const { updateProcessContent } = useUpdateProcessContent();
  const { publishProcess, isPending } = usePublishProcess(departmentId, teamId);

  const [cancelTrigger, cancelDialog] = useConfirmDialog({
    title: "Discard unsaved changes?",
    description:
      "You have unsaved changes. Are you sure you want to leave? This action cannot be undone.",
    action: async () => {
      return {
        status: "SUCCESS" as const,
        message: "",
        fieldErrors: {},
        timestamp: Date.now(),
      };
    },
    trigger: (isLoading) => (
      <Button
        variant="outline"
        disabled={isLoading || isCancelling || isSaving || isPending}
      >
        {isLoading || isCancelling ? (
          <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Cancel
      </Button>
    ),
    onSuccess: () => {
      handleCancelEdit(
        router,
        departmentId,
        teamId,
        startTransition,
        teamProcessPath,
      );
    },
  });

  const handleCancelWithoutChanges = () => {
    handleCancelEdit(
      router,
      departmentId,
      teamId,
      startTransition,
      teamProcessPath,
    );
  };

  const handleContentChange = useCallback((newContent: ProcessContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(
    (silent = false) => {
      handleSaveProcess({
        process,
        processId,
        content,
        updateFn: updateProcessContent,
        setIsSaving,
        setHasUnsavedChanges,
        silent,
      });
    },
    [process, processId, content, updateProcessContent],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasUnsavedChanges, handleSave]);

  const handlePublish = () => {
    handlePublishProcess({
      processId,
      hasUnsavedChanges,
      publishFn: publishProcess,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <ProcessHeader
        process={process}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isDisabled={isSaving || isCancelling || isPending}
        departmentId={departmentId}
        teamId={teamId}
      />

      <ProcessEditorSelector
        processStyle={process.style}
        content={content}
        onChange={handleContentChange}
        isPreview={viewMode === "preview"}
      />

      <ProcessActionButtons
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        isCancelling={isCancelling}
        isPublishing={isPending}
        process={process}
        onSave={() => handleSave(false)}
        onPublish={handlePublish}
        cancelTrigger={cancelTrigger}
        cancelDialog={cancelDialog}
        onCancelWithoutChanges={handleCancelWithoutChanges}
      />
    </div>
  );
};
