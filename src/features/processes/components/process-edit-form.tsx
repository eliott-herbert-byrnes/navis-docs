"use client";

import { useRouter } from "next/navigation";
import { ProcessForEdit } from "../queries/get-process-for-edit";
import { useState, useTransition, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { updateProcessContent } from "../actions/update-process-content";
import { publishProcess } from "../actions/publish-process";
import { teamProcessPath } from "@/app/paths";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Eye, LucideLoaderCircle, Save } from "lucide-react";
import { RawTextEditor } from "./editors/raw-text-editor";

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
  const [content, setContent] = useState(initialContent);

  const handleContentChange = useCallback((newContent: any) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(async (silent = false) => {
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
  }, [process.pendingVersion, processId, content]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave(true); 
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasUnsavedChanges, handleSave]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    startTransition(() => {
      router.push(teamProcessPath(departmentId, teamId));
    });
  };

  const handlePublish = async () => {
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

  const renderEditor = () => {
    switch (process.style) {
      case "RAW":
        return (
          <RawTextEditor
            content={content}
            onChange={handleContentChange}
            isPreview={viewMode === "preview"}
          />
        );
      case "STEPS":
        return (
          <div className="p-8 text-center text-muted-foreground">
            Steps editor will be implemented next
          </div>
        );
      case "FLOW":
        return (
          <div className="p-8 text-center text-muted-foreground">
            Flow editor will be implemented next
          </div>
        );
      case "YESNO":
        return (
          <div className="p-8 text-center text-muted-foreground">
            Yes/No editor will be implemented next
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            Unsupported process style
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header Card with Process Info */}
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{process.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {process.description}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-secondary rounded">
                {process.style}
              </span>
              <span className="text-xs px-2 py-1 bg-secondary rounded">
                {process.status}
              </span>
              {process.category && (
                <span className="text-xs px-2 py-1 bg-secondary rounded">
                  {process.category.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("edit")}
              disabled={isSaving || isCancelling || isPublishing}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("preview")}
              disabled={isSaving || isCancelling || isPublishing}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </Card>

      {/* Editor Card */}
      <Card className="p-6 min-h-[600px]">{renderEditor()}</Card>

      {/* Action Buttons Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 font-medium">● Unsaved changes</span>
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
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling || isSaving || isPublishing}
            >
              {isCancelling ? (
                <>
                  <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                </>
              ) : (
                "Cancel"
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              disabled={isSaving || isCancelling || isPublishing || !hasUnsavedChanges}
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
              onClick={handlePublish}
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
    </div>
  );
};