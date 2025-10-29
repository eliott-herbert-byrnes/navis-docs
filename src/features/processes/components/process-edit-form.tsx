"use client";

import { useRouter } from "next/navigation";
import { ProcessForEdit } from "../queries/get-process-for-edit";
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

type EditProcessFormProps = {
  departmentId: string;
  teamId: string;
  processId: string;
  process: ProcessForEdit;
  categories: { id: string; name: string }[];
};

export const EditProcessForm = ({
  departmentId,
  teamId,
  processId,
  process,
  categories,
}: EditProcessFormProps) => {
  const router = useRouter();
  const [isCancelling, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const initialContent =
    process.pendingVersion?.contentJSON ||
    process.publishedVersion?.contentJSON ||
    {};

  const [content, setContent] = useState<ProcessContent>(initialContent);

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
        disabled={isLoading || isCancelling || isSaving || isPublishing}
      >
        {isLoading || isCancelling ? (
          <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Cancel
      </Button>
    ),
    onSuccess: () => {
      handleCancelEdit(router, departmentId, teamId, startTransition, teamProcessPath);
    },
  });

  const handleCancelWithoutChanges = () => {
    handleCancelEdit(router, departmentId, teamId, startTransition, teamProcessPath);
  };

  const handleContentChange = useCallback((newContent: ProcessContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(
    async (silent = false) => {
      await handleSaveProcess({
        process,
        processId,
        content,
        setIsSaving,
        setHasUnsavedChanges,
        silent,
      });
    },
    [process, processId, content]
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasUnsavedChanges, handleSave]);

  const handlePublish = async () => {
    await handlePublishProcess({
      processId,
      hasUnsavedChanges,
      setIsPublishing,
      router,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <ProcessHeader
        process={process}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isDisabled={isSaving || isCancelling || isPublishing}
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
        isPublishing={isPublishing}
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
