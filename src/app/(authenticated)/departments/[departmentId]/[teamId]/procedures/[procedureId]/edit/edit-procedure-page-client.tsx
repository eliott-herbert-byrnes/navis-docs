"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { ChevronDown, PencilIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProcedureForm } from "@/features/procedures/components/procedure-edit-form";
import { ProcedureEditDetailsDialog } from "@/features/procedures/components/procedure-edit-details-dialog";
import { ProcedureDeleteButtonDialog } from "@/features/procedures/components/procedure-delete-button-dialog";
import { useDeleteProcedure } from "@/features/procedures/hooks/use-procedure-mutations";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { useAuthContext } from "@/contexts/auth-context";
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
  const [headingTitle, setHeadingTitle] = useState(procedure.title);
  const [headingDescription, setHeadingDescription] = useState(
    procedure.description ?? "",
  );
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { departmentId, teamId } = useProcedureRouteContext();
  const { deleteProcedure, isPending: isDeletePending } = useDeleteProcedure(
    departmentId,
    teamId,
  );
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    setHeadingTitle(procedure.title);
    setHeadingDescription(procedure.description ?? "");
  }, [procedure.title, procedure.description]);

  useEffect(() => {
    if (viewMode === "preview") {
      setEditDetailsOpen(false);
    }
  }, [viewMode]);

  const handleHeaderDisabledChange = useCallback((disabled: boolean) => {
    setIsHeaderDisabled(disabled);
  }, []);

  const actions = (
    <>
      {procedure.style === "FLOW" ? (
        <Button
          variant={editorPane === "flow" ? "outline" : "outline"}
          size="sm"
          onClick={() => setEditorPane((m) => (m === "flow" ? "text" : "flow"))}
          disabled={isHeaderDisabled}
        >
          <PencilIcon className="h-4 w-4" />
          {editorPane === "flow" ? "Flow" : "Text"}
        </Button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="shadow-none"
            disabled={isHeaderDisabled}
          >
            Actions <ChevronDown className="size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex flex-col gap-1 p-0 m-0"
        >
          {viewMode === "edit" ? (
            <DropdownMenuItem
              className="cursor-pointer rounded-none px-4 py-2 font-medium"
              onSelect={() => setEditDetailsOpen(true)}
              disabled={isHeaderDisabled}
            >
              Edit details
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className="cursor-pointer rounded-none px-4 py-2 font-medium"
            onSelect={() =>
              setViewMode((m) => (m === "edit" ? "preview" : "edit"))
            }
            disabled={isHeaderDisabled}
          >
            {viewMode === "preview" ? "Amend" : "Preview"}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer rounded-none px-4 py-2 font-medium"
            onSelect={() => setDeleteConfirmOpen(true)}
            disabled={isHeaderDisabled || !isAdmin}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProcedureDeleteButtonDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Are you sure you want to delete this procedure?"
        description="This action cannot be undone."
        isPending={isDeletePending}
        onConfirm={() => deleteProcedure(procedure.id)}
      />
    </>
  );

  return (
    <>
      <ProcedureEditDetailsDialog
        procedureId={procedureId}
        open={editDetailsOpen}
        onOpenChange={setEditDetailsOpen}
        initialTitle={headingTitle}
        initialDescription={headingDescription}
        disabled={isHeaderDisabled}
        onSuccess={({ title, description }) => {
          setHeadingTitle(title);
          setHeadingDescription(description);
        }}
      />

      <Heading
        title={headingTitle}
        description={headingDescription || undefined}
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
