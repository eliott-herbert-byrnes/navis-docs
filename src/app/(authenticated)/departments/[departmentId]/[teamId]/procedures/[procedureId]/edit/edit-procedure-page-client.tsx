"use client";

import { useCallback, useState, Suspense } from "react";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { Eye, PencilIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProcedureForm } from "@/features/procedures/components/procedure-edit-form";
import { ProcedureDeleteButton } from "@/features/procedures/components/procedure-delete-button";
import type { ProcedureForEdit } from "@/features/procedures/types/types";

type EditProcedurePageClientProps = {
  procedureId: string;
  procedure: ProcedureForEdit;
};

function EditProcedureFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function EditProcedurePageClient({
  procedureId,
  procedure,
}: EditProcedurePageClientProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [editorPane, setEditorPane] = useState<"flow" | "text">("flow");
  const [isHeaderDisabled, setIsHeaderDisabled] = useState(false);

  const handleHeaderDisabledChange = useCallback((disabled: boolean) => {
    setIsHeaderDisabled(disabled);
  }, []);

  const actions = (
    <>
      {procedure.style === "FLOW" ? (
        <Button
          variant={editorPane === "flow" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            setEditorPane((m) => (m === "flow" ? "text" : "flow"))
          }
          disabled={isHeaderDisabled}
        >
          <PencilIcon className="h-4 w-4" />
          {editorPane === "flow" ? "Flow" : "Text"}
        </Button>
      ) : null}

      <Button
        variant={viewMode === "preview" ? "default" : "outline"}
        size="sm"
        onClick={() =>
          setViewMode((m) => (m === "edit" ? "preview" : "edit"))
        }
        disabled={isHeaderDisabled}
      >
        <Eye className="h-4 w-4" />
        {viewMode === "preview" ? "Amend" : "Preview"}
      </Button>

      <ProcedureDeleteButton procedureId={procedure.id} />
    </>
  );

  return (
    <>
      <Heading
        title={procedure.title}
        description={procedure.description ?? undefined}
        actions={actions}
      />

      <Suspense fallback={<EditProcedureFormSkeleton />}>
        <EditProcedureForm
          procedureId={procedureId}
          procedure={procedure}
          viewMode={viewMode}
          editorPane={editorPane}
          onHeaderDisabledChange={handleHeaderDisabledChange}
        />
      </Suspense>
    </>
  );
}

