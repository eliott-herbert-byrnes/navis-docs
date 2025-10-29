import { toast } from "sonner";
import { updateProcessContent } from "../../../actions/update-process-content";
import { publishProcess } from "../../../actions/publish-process";
import { ProcessForEdit } from "../../../queries/get-process-for-edit";
import { JSONContent } from "@tiptap/react";
import { Step } from "../../editors/steps-editor";
import { FlowContent } from "../../flow-editor";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type ProcessContent = {
  tiptap?: JSONContent;
  steps?: Step[];
  flow?: FlowContent;
};

type SaveProcessParams = {
  process: ProcessForEdit;
  processId: string;
  content: ProcessContent;
  setIsSaving: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  silent?: boolean;
};

type PublishProcessParams = {
  processId: string;
  hasUnsavedChanges: boolean;
  setIsPublishing: (value: boolean) => void;
  router: AppRouterInstance;
};

export const handleSaveProcess = async ({
  process,
  processId,
  content,
  setIsSaving,
  setHasUnsavedChanges,
  silent = false,
}: SaveProcessParams) => {
  if (!process.pendingVersion) {
    toast.error("No pending version found");
    return;
  }

  setIsSaving(true);
  try {
    const formData = new FormData();
    formData.append("processId", processId);
    formData.append("versionId", process.pendingVersion.id);
    formData.append("contentJSON", JSON.stringify(content));

    const result = await updateProcessContent(
      {
        message: "",
        fieldErrors: {},
        timestamp: Date.now(),
      },
      formData
    );

    if (result.status === "SUCCESS") {
      setHasUnsavedChanges(false);
      if (!silent) toast.success("Changes saved successfully");
    } else {
      toast.error(result.message || "Failed to save");
    }
  } catch (error) {
    toast.error("An error occurred while saving");
    console.error(error);
  } finally {
    setIsSaving(false);
  }
};

export const handlePublishProcess = async ({
  processId,
  hasUnsavedChanges,
  setIsPublishing,
  router,
}: PublishProcessParams) => {
  if (hasUnsavedChanges) {
    toast.error("Please save your changes before publishing");
    return;
  }

  setIsPublishing(true);
  try {
    const formData = new FormData();
    formData.append("processId", processId);

    const result = await publishProcess(
      {
        message: "",
        fieldErrors: {},
        timestamp: Date.now(),
      },
      formData
    );

    if (result.status === "SUCCESS") {
      toast.success("Process published successfully");
      router.refresh();
    } else {
      toast.error(result.message || "Failed to publish");
    }
  } catch (error) {
    toast.error("An error occurred while publishing");
    console.error(error);
  } finally {
    setIsPublishing(false);
  }
};

export const handleCancelEdit = (
  router: AppRouterInstance,
  departmentId: string,
  teamId: string,
  startTransition: React.TransitionStartFunction,
  teamProcessPath: (departmentId: string, teamId: string) => string
) => {
  startTransition(() => {
    router.push(teamProcessPath(departmentId, teamId));
  });
};

