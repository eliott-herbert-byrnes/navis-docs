import { Card } from "@/components/ui/card";
import { RawTextEditor } from "../../editors/raw-text-editor";
import { StepsEditor } from "../../editors/steps-editor";
import { FlowEditor } from "../../flow-editor";
import { ProcessContent } from "../utils/process-edit-utils";
import { ReactFlowProvider } from "reactflow";
import { YesNoPairsEditor } from "@/features/processes/components/editors/yesno-pairs-editor";

type ProcessEditorSelectorProps = {
  processStyle: "RAW" | "STEPS" | "FLOW" | "YESNO";
  content: ProcessContent;
  onChange: (content: ProcessContent) => void;
  isPreview: boolean;
};

export function ProcessEditorSelector({
  processStyle,
  content,
  onChange,
  isPreview,
}: ProcessEditorSelectorProps) {
  const renderEditor = () => {
    switch (processStyle) {
      case "RAW":
        return (
          <RawTextEditor
            content={content}
            onChange={onChange}
            isPreview={isPreview}
          />
        );
      case "STEPS":
        return (
          <StepsEditor
            content={content}
            onChange={onChange}
            isPreview={isPreview}
          />
        );
      case "FLOW":
        return (
          <ReactFlowProvider>
            <FlowEditor
              content={content}
              onChange={onChange}
              isPreview={isPreview}
            />
          </ReactFlowProvider>
        );
      case "YESNO":
        return (
          <YesNoPairsEditor
            content={content}
            onChange={onChange}
            isPreview={isPreview}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            Unsupported process style
          </div>
        );
    }
  };

  if (processStyle === "FLOW") {
    return <Card className="min-h-[600px] overflow-hidden">{renderEditor()}</Card>;
  }

  return <Card className="p-6 min-h-[600px]">{renderEditor()}</Card>;
}

