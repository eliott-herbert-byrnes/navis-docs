import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { ProcessForEdit } from "../../../queries/get-process-for-edit";

type ProcessHeaderProps = {
  process: ProcessForEdit;
  viewMode: "edit" | "preview";
  onViewModeChange: (mode: "edit" | "preview") => void;
  isDisabled: boolean;
};

export function ProcessHeader({
  process,
  viewMode,
  onViewModeChange,
  isDisabled,
}: ProcessHeaderProps) {
  return (
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
            onClick={() => onViewModeChange("edit")}
            disabled={isDisabled}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={viewMode === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("preview")}
            disabled={isDisabled}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>
    </Card>
  );
}

