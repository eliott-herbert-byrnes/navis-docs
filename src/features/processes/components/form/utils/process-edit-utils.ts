import { toast } from "sonner";
import { JSONContent } from "@tiptap/react";
import { Step } from "../../editors/steps-editor";
import { FlowContent } from "../../editors/flow-editor";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ProcessForEdit } from "@/features/processes/types/types";

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

export type ProcessContent = {
  tiptap?: JSONContent;
  steps?: Step[];
  flow?: FlowContent;
  yesno?: YesNoContent;
};

type SaveProcessParams = {
  process: ProcessForEdit;
  processId: string;
  content: ProcessContent;
  updateFn: (
    processId: string,
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

type PublishProcessParams = {
  processId: string;
  hasUnsavedChanges: boolean;
  publishFn: (processId: string) => void;
};

export const handleSaveProcess = async ({
  process,
  processId,
  content,
  updateFn,
  setIsSaving,
  setHasUnsavedChanges,
  silent = false,
}: SaveProcessParams) => {
  if (!process.pendingVersion) {
    toast.error("No pending version found");
    return;
  }

  setIsSaving(true);

  updateFn(processId, process.pendingVersion.id, content, {
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

export const handlePublishProcess = ({
  processId,
  hasUnsavedChanges,
  publishFn,
}: PublishProcessParams) => {
  if (hasUnsavedChanges) {
    toast.error("Please save your changes before publishing");
    return;
  }

  publishFn(processId);
};

export const handleCancelEdit = (
  router: AppRouterInstance,
  departmentId: string,
  teamId: string,
  startTransition: React.TransitionStartFunction,
  teamProcessPath: (departmentId: string, teamId: string) => string,
) => {
  startTransition(() => {
    router.push(teamProcessPath(departmentId, teamId));
  });
};
