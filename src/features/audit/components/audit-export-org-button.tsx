"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessButton, AccessDialogTrigger } from "@/components/ui/access-button";
import type { AuditEntityType } from "@/features/audit/utils/audit-export-filters";
import { trpc } from "@/trpc/client";
import { FileJson, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type AuditExportUrlFilters = {
  search?: string;
  entityType?: AuditEntityType;
  startDate?: string;
  endDate?: string;
};

type AuditExportOrgButtonProps = {
  filters: AuditExportUrlFilters;
};

export function AuditExportOrgButton({ filters }: AuditExportOrgButtonProps) {
  const [open, setOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const downloadTriggeredRef = useRef(false);

  const start = trpc.audit.startAuditExport.useMutation({
    onSuccess: (data) => {
      setJobId(data.jobId);
      if (data.alreadyRunning) {
        toast.message(
          "An export is already in progress; showing its status…",
        );
      }
    },
    onError: (e) => {
      toast.error(e.message ?? "Could not start export");
    },
  });

  const statusQuery = trpc.audit.getAuditExportStatus.useQuery(
    { jobId: jobId! },
    {
      enabled: open && !!jobId,
      refetchInterval: (q) => {
        const s = q.state.data?.status;
        if (s === "QUEUED" || s === "PROCESSING") return 2000;
        return false;
      },
    },
  );

  const ack = trpc.audit.ackAuditExportDownloaded.useMutation();

  useEffect(() => {
    if (!statusQuery.data || !jobId) return;
    const { status, downloadUrl, error } = statusQuery.data;

    if (status === "FAILED") {
      toast.error(error ?? "Export failed");
      setJobId(null);
      downloadTriggeredRef.current = false;
      return;
    }

    if (
      status === "READY" &&
      downloadUrl &&
      !downloadTriggeredRef.current
    ) {
      downloadTriggeredRef.current = true;
      window.location.href = downloadUrl;
      ack.mutate({ jobId });
      toast.success("Download started");
      setOpen(false);
      setJobId(null);
    }
  }, [statusQuery.data, jobId, ack]);

  const handleStart = () => {
    downloadTriggeredRef.current = false;
    start.mutate({
      search: filters.search,
      entityType: filters.entityType,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  };

  const busy =
    start.isPending ||
    statusQuery.data?.status === "QUEUED" ||
    statusQuery.data?.status === "PROCESSING";

  let statusLabel = "";
  if (statusQuery.data?.status === "QUEUED") {
    statusLabel = "Queued…";
  } else if (statusQuery.data?.status === "PROCESSING") {
    statusLabel = "Building JSON file…";
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setJobId(null);
          downloadTriggeredRef.current = false;
        }
      }}
    >
      <AccessDialogTrigger adminOnly>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <FileJson className="h-4 w-4" />
          Export JSON
        </Button>
      </AccessDialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export audit logs</DialogTitle>
          <DialogDescription>
            Download a JSON file of audit events for this organization. The
            export uses your current search and filters from this page.
          </DialogDescription>
        </DialogHeader>
        {statusLabel ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {statusLabel}
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <AccessButton
            adminOnly
            type="button"
            onClick={handleStart}
            isLoading={busy}
          >
            Start export
          </AccessButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
