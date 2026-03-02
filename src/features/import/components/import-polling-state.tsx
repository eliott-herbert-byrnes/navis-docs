"use client";
import { Card } from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import { LucideLoaderCircle } from "lucide-react";
import { useEffect } from "react";

type ImportPollingStateProps = {
  jobId: string;
  onJobReady: () => void;
  onJobFailed: (errorMessage?: string) => void;
};

const ImportPollingState = ({
  jobId,
  onJobReady,
  onJobFailed,
}: ImportPollingStateProps) => {
  const { data } = trpc.ingestion.getJobStatus.useQuery(
    { jobId },
    {
      refetchInterval: 2000,
      enabled: !!jobId,
    },
  );

  useEffect(() => {
    if (!data) return;

    if (data.status === "READY") {
      onJobReady();
    } else if (data.status === "FAILED") {
      onJobFailed(data.error ?? "Import failed. Please try again.");
    }
  }, [data, onJobReady, onJobFailed]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // If still not READY or FAILED after 120s, treat as failure.
      if (!data || (data.status !== "READY" && data.status !== "FAILED")) {
        onJobFailed("Import is taking too long. Please try again.");
      }
    }, 120_000);

    return () => clearTimeout(timeout);
  }, [data, onJobFailed]);

  let label = "Starting import...";
  if (!data) {
    label = "Starting import...";
  } else if (data.status === "QUEUED") {
    label = "Queued for processing…";
  } else if (data.status === "PARSING") {
    label = "Reading document…";
  } else if (data.status === "GENERATING") {
    label = "Structuring content with AI…";
  } else if (data.status === "READY") {
    label = "Finalising…";
  } else if (data.status === "FAILED") {
    label = "Import failed.";
  }

  return (
    <div className="w-full max-w-[700px] mx-auto my-auto">
      <Card className="p-6 flex flex-col items-center justify-center gap-4 text-center">
        <LucideLoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          You can stay on this page while we process your file. This may take up
          to a minute.
        </p>
      </Card>
    </div>
  );
};

export { ImportPollingState };
