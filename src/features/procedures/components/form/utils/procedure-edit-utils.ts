import { toast } from "sonner";
import { JSONContent } from "@tiptap/react";
import { Step } from "../../editors/steps-editor";
import { FlowContent } from "../../editors/flow-editor";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ProcedureForEdit } from "@/features/procedures/types/types";

export type YesNoNode = {
  id: string;
  question: string;
  description?: string;
  yesNodeId?: string;
  noNodeId?: string;
  isEndNode?: boolean;
  endMessage?: string;
};

export type YesNoContent = {
  nodes: YesNoNode[];
  startNodeId?: string;
};

export type ProcedureContent = {
  tiptap?: JSONContent;
  steps?: Step[];
  flow?: FlowContent;
  yesno?: YesNoContent;
};

type SaveProcedureParams = {
  procedure: ProcedureForEdit;
  procedureId: string;
  content: ProcedureContent;
  updateFn: (
    procedureId: string,
    versionId: string,
    contentJSON: unknown,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      silent?: boolean;
    },
  ) => void;
  setIsSaving: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  silent?: boolean;
};

type PublishProcedureParams = {
  procedureId: string;
  hasUnsavedChanges: boolean;
  publishFn: (procedureId: string) => void;
};

export const handleSaveProcedure = async ({
  procedure,
  procedureId,
  content,
  updateFn,
  setIsSaving,
  setHasUnsavedChanges,
  silent = false,
}: SaveProcedureParams) => {
  if (!procedure.pendingVersion) {
    toast.error("No pending version found");
    return;
  }

  setIsSaving(true);

  updateFn(procedureId, procedure.pendingVersion.id, content, {
    onSuccess: () => {
      setHasUnsavedChanges(false);
      setIsSaving(false);
    },
    onError: (error) => {
      setIsSaving(false);
      console.error(error);
    },
    silent,
  });
};

export const handlePublishProcedure = ({
  procedureId,
  hasUnsavedChanges,
  publishFn,
}: PublishProcedureParams) => {
  if (hasUnsavedChanges) {
    toast.error("Please save your changes before publishing");
    return;
  }

  publishFn(procedureId);
};

export const handleCancelEdit = (
  router: AppRouterInstance,
  departmentId: string,
  teamId: string,
  startTransition: React.TransitionStartFunction,
  teamProcedurePath: (departmentId: string, teamId: string) => string,
) => {
  startTransition(() => {
    router.push(teamProcedurePath(departmentId, teamId));
  });
};
