import { Button } from "@/components/ui/button";
import { JSONContent } from "@tiptap/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  addStep,
  createEmptyStep,
  deleteStep,
  toggleStepExpand,
  updateStepDescription,
  updateSteps,
  updateStepTitle,
} from "./utils/steps-editor-utils";
import { StepItem } from "./components/step-item";

export type Step = {
  id: string;
  title: string;
  description: string;
  isExpanded?: boolean;
};

export type ProcessContent = {
  tiptap?: JSONContent;
  steps?: Step[];
};

type StepsEditorProps = {
  content: ProcessContent;
  onChange: (newContent: ProcessContent) => void;
  isPreview: boolean;
};

export function StepsEditor({
  content,
  onChange,
  isPreview,
}: StepsEditorProps) {
  // Ensure all steps have IDs
  const initialSteps = content?.steps?.length
    ? content.steps.map((step, index) => ({
        ...step,
        id:
          step.id ||
          `step-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      }))
    : [createEmptyStep()];
  const [steps, setSteps] = useState<Step[]>(initialSteps);

  const handleUpdateSteps = (newSteps: Step[]) => {
    updateSteps(setSteps, newSteps, onChange, content);
  };

  return (
    <div className="space-y-4">
      {isPreview ? (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              onUpdateTitle={() => {}}
              onUpdateDescription={() => {}}
              onDelete={() => {}}
              onToggleExpand={() => {}}
              onAddAfter={() => {}}
              isPreview={true}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                index={index}
                onUpdateTitle={(title) =>
                  updateStepTitle(step.id, title, steps, handleUpdateSteps)
                }
                onUpdateDescription={(desc) =>
                  updateStepDescription(step.id, desc, steps, handleUpdateSteps)
                }
                onDelete={() => deleteStep(step.id, steps, handleUpdateSteps)}
                onToggleExpand={() =>
                  toggleStepExpand(step.id, steps, handleUpdateSteps)
                }
                onAddAfter={() => addStep(steps, handleUpdateSteps, index)}
                isPreview={false}
              />
            ))}
          </div>

          {/* Add Step Button at Bottom */}
          <Button
            variant="outline"
            onClick={() => addStep(steps, handleUpdateSteps)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </>
      )}
    </div>
  );
}
