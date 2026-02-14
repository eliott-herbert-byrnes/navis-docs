import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, PencilIcon } from "lucide-react";
import { ProcedureForEdit } from "@/features/procedures/types/types";
import { ProcedureDeleteButton } from "../../procedure-delete-button";

type ProcedureHeaderProps = {
  procedure: ProcedureForEdit;
  viewMode: "edit" | "preview";
  onViewModeChange: () => void;
  editorMode: "flow" | "text";
  onEditorChange: () => void;
  isDisabled: boolean;
};

export function ProcedureHeader({
  procedure,
  viewMode,
  onViewModeChange,
  isDisabled,
  editorMode,
  onEditorChange,
}: ProcedureHeaderProps) {
  return (
    <Card className="p-4 animate-fade-from-top">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{procedure.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {procedure.description}
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-secondary rounded">
              {procedure.style}
            </span>
            <span className="text-xs px-2 py-1 bg-secondary rounded">
              {procedure.status}
            </span>
            {procedure.category && (
              <span className="text-xs px-2 py-1 bg-secondary rounded">
                {procedure.category.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {procedure.style === "FLOW" ? (
            <Button
              variant={editorMode === "flow" ? "default" : "outline"}
              size="sm"
              onClick={() => onEditorChange()}
              disabled={isDisabled}
            >
              <PencilIcon className="h-4 w-4" />
              {editorMode === "flow" ? "Flow" : "Text"}
            </Button>
          ) : null}
          <Button
            variant={viewMode === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange()}
            disabled={isDisabled}
          >
            <Eye className="h-4 w-4" />
            {viewMode === "preview" ? "Amend" : "Preview"}
          </Button>
          <ProcedureDeleteButton procedureId={procedure.id} />
        </div>
      </div>
    </Card>
  );
}
