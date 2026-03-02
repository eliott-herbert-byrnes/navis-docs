"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import { LucideLoaderCircle } from "lucide-react";
import { useImportMutations } from "../hooks/use-import-mutations";

type ImportPreviewCardProps = {
  jobId: string;
  onApprove: () => void;
  onReject: () => void;
};

const ImportPreviewCard = ({
  jobId,
  onApprove,
  onReject,
}: ImportPreviewCardProps) => {
  const { data, isLoading, error } = trpc.ingestion.getJobStatus.useQuery(
    { jobId },
    { enabled: !!jobId },
  );

  const { approveImportMutation, rejectImportMutation } = useImportMutations();

  const handleApproveClick = () => {
    approveImportMutation.mutate({ jobId }, { onSuccess: () => onApprove() });
  };

  const handleRejectClick = () => {
    rejectImportMutation.mutate({ jobId }, { onSuccess: () => onReject() });
  };

  // Loading: show spinner + message (consistent with ImportPollingState)
  if (isLoading) {
    return (
      <div className="w-full max-w-[700px] mx-auto my-auto">
        <Card className="p-6 flex flex-col items-center justify-center gap-4 text-center">
          <LucideLoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium">Loading preview…</p>
        </Card>
      </div>
    );
  }

  // Error or no data: show message + Back button (go back to form; do not reject/delete)
  if (error || !data) {
    return (
      <div className="w-full max-w-[700px] mx-auto my-auto">
        <Card className="p-6 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm font-medium text-destructive">
            {error?.message ?? "Could not load preview."}
          </p>
          <Button variant="outline" type="button" onClick={onReject}>
            Back
          </Button>
        </Card>
      </div>
    );
  }

  // Job not ready (e.g. race or stale state): show message + Back button
  if (data.status !== "READY") {
    return (
      <div className="w-full max-w-[700px] mx-auto my-auto">
        <Card className="p-6 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Preview is not available. The import may still be processing.
          </p>
          <Button variant="outline" type="button" onClick={onReject}>
            Back
          </Button>
        </Card>
      </div>
    );
  }

  const title = data.procedure?.title ?? "Untitled procedure";
  const filename = data.filename ?? "Unknown file";
  const characterCount = data.characterCount ?? 0;
  const preview = data.contentPreview ?? "(No preview text available)";

  return (
    <div className="w-full max-w-[700px] mx-auto my-auto">
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">
            Source file: {filename} · {characterCount} characters
          </p>
        </div>

        <div className="border rounded-md p-3 max-h-64 overflow-y-auto bg-muted/30">
          <p className="text-sm whitespace-pre-wrap">{preview}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          This procedure will be saved as a Draft. You can edit and publish it
          after import.
        </p>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={handleRejectClick}
            disabled={
              approveImportMutation.isPending || rejectImportMutation.isPending
            }
          >
            {rejectImportMutation.isPending ? (
              <LucideLoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              "Reject"
            )}
          </Button>
          <Button
            type="button"
            onClick={handleApproveClick}
            disabled={
              approveImportMutation.isPending || rejectImportMutation.isPending
            }
          >
            {approveImportMutation.isPending ? (
              <>
                <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Approving…
              </>
            ) : (
              "Approve & continue"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export { ImportPreviewCard };
