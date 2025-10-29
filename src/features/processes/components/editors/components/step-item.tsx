import { Step } from "../steps-editor";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type StepItemProps = {
  step: Step;
  index: number;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string) => void;
  onDelete: () => void;
  onToggleExpand: () => void;
  onAddAfter: () => void;
  isPreview: boolean;
};

export function StepItem({
  step,
  index,
  onUpdateTitle,
  onUpdateDescription,
  onDelete,
  onToggleExpand,
  onAddAfter,
  isPreview,
}: StepItemProps) {
  if (isPreview) {
    return (
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {index + 1}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              {step.title || `Step ${index + 1}`}
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {step.description}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex gap-2">
        {/* Step Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
          {index + 1}
        </div>

        {/* Step Content */}
        <div className="flex-1 space-y-3">
          {/* Title Input */}
          <Input
            placeholder={`Step ${index + 1} title...`}
            value={step.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="font-semibold"
          />

          {/* Collapsible Content */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="p-0 h-auto"
            >
              {step.isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              {step.isExpanded ? "Collapse" : "Expand"} details
            </Button>

            {step.isExpanded && (
              <div className="pl-4 border-l-2 border-muted">
                <Textarea
                  placeholder="Step description..."
                  value={step.description}
                  onChange={(e) => onUpdateDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddAfter}
            title="Add step below"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            title="Delete step"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
