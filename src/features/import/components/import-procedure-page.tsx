"use client";
import { procedureBasePath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ImportStepOneForm } from "./import-step-one-form";
import { ImportPollingState } from "./import-polling-state";
import { ImportPreviewCard } from "./import-preview-card";

export type DepartmentItem = {
  id: string;
  name: string;
  teams: { id: string; name: string; _count?: { procedure: number } }[];
};

type ImportProcedurePageProps = {
  departments: DepartmentItem[];
};

type ImportStep = "form" | "polling" | "preview" | "error";

export function ImportProcedurePage({ departments }: ImportProcedurePageProps) {
  const [step, setStep] = useState<ImportStep>("form");
  const [jobId, setJobId] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmitSuccess = useCallback((id: string) => {
    setJobId(id);
    setStep("polling");
  }, []);

  const handleJobReady = useCallback(() => {
    setStep("preview");
  }, []);

  const handleJobFailed = useCallback(() => {
    setStep("error");
  }, []);

  const handleApprove = useCallback(() => {
    router.push(procedureBasePath()); // or router.replace
    toast.success("Procedure imported successfully.");
  }, [router]);

  const handleReject = useCallback(() => {
    setJobId(null);
    setStep("form");
  }, []);

  if (step === "form") {
    return (
      <ImportStepOneForm
        departments={departments}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );
  }
  if (step === "polling" && jobId) {
    return (
      <ImportPollingState
        jobId={jobId}
        onJobReady={handleJobReady}
        onJobFailed={handleJobFailed}
      />
    );
  }
  if (step === "preview" && jobId) {
    return (
      <ImportPreviewCard
        jobId={jobId}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }
  if (step === "error") {
    return (
      <div>
        <p>Import failed. Please try again.</p>
        <Button onClick={handleReject}>Try again</Button>
      </div>
    );
  }
  return null;
}
