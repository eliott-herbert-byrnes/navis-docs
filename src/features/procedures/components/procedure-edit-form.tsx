"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback, useEffect } from "react";
import { teamProcedurePath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle } from "lucide-react";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProcedureHeader } from "./form/components/procedure-header";
import { ProcedureActionButtons } from "./form/components/procedure-action-buttons";
import { ProcedureEditorSelector } from "./form/components/procedure-editor-selector";
import {
  ProcedureContent,
  handleSaveProcedure,
  handlePublishProcedure,
  handleCancelEdit,
} from "./form/utils/procedure-edit-utils";
import { ProcedureForEdit } from "../types/types";
import {
  usePublishProcedure,
  useUpdateProcedureContent,
} from "../hooks/use-procedure-mutations";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";

type EditProcedureFormProps = {
  procedureId: string;
  procedure: ProcedureForEdit;
};

export const EditProcedureForm = ({
  procedureId,
  procedure,
}: EditProcedureFormProps) => {
  const router = useRouter();
  const [isCancelling, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { departmentId, teamId } = useProcedureRouteContext();

  const initialContent: ProcedureContent =
    (procedure.pendingVersion?.contentJSON as ProcedureContent) ||
    (procedure.publishedVersion?.contentJSON as ProcedureContent) ||
    ({} as ProcedureContent);

  const [content, setContent] = useState<ProcedureContent>(initialContent);

  const { updateProcedureContent } = useUpdateProcedureContent();
  const { publishProcedure, isPending } = usePublishProcedure(
    departmentId,
    teamId,
  );

  const handleViewMode = () => viewMode === 'edit' ? setViewMode('preview') : setViewMode('edit')

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
        teamProcedurePath,
      );
    },
  });

  const handleCancelWithoutChanges = () => {
    handleCancelEdit(
      router,
      departmentId,
      teamId,
      startTransition,
      teamProcedurePath,
    );
  };

  const handleContentChange = useCallback((newContent: ProcedureContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(
    (silent = false) => {
      handleSaveProcedure({
        procedure,
        procedureId,
        content,
        updateFn: updateProcedureContent,
        setIsSaving,
        setHasUnsavedChanges,
        silent,
      });
    },
    [procedure, procedureId, content, updateProcedureContent],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasUnsavedChanges, handleSave]);

  const handlePublish = () => {
    handlePublishProcedure({
      procedureId,
      hasUnsavedChanges,
      publishFn: publishProcedure,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <ProcedureHeader
        procedure={procedure}
        viewMode={viewMode}
        onViewModeChange={handleViewMode}
        isDisabled={isSaving || isCancelling || isPending}
      />

      <ProcedureEditorSelector
        procedureStyle={procedure.style}
        content={content}
        onChange={handleContentChange}
        isPreview={viewMode === "preview"}
      />

      <ProcedureActionButtons
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        isCancelling={isCancelling}
        isPublishing={isPending}
        procedure={procedure}
        onSave={() => handleSave(false)}
        onPublish={handlePublish}
        cancelTrigger={cancelTrigger}
        cancelDialog={cancelDialog}
        onCancelWithoutChanges={handleCancelWithoutChanges}
      />
    </div>
  );
};
