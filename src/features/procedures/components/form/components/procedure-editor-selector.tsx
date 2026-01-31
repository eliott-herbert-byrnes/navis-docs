import { Card } from "@/components/ui/card";
import { RawTextEditor } from "../../editors/raw-text-editor";
import { StepsEditor } from "../../editors/steps-editor";
import { FlowEditor } from "../../editors/flow-editor";
import { ProcedureContent } from "../utils/procedure-edit-utils";
import { ReactFlowProvider } from "reactflow";
import { YesNoPairsEditor } from "@/features/procedures/components/editors/yesno-pairs-editor";

type ProcedureEditorSelectorProps = {
  procedureStyle: "RAW" | "STEPS" | "FLOW" | "YESNO";
  content: ProcedureContent;
  onChange: (content: ProcedureContent) => void;
  isPreview: boolean;
};

export function ProcedureEditorSelector({
  procedureStyle,
  content,
  onChange,
  isPreview,
}: ProcedureEditorSelectorProps) {
  const renderEditor = () => {
    switch (procedureStyle) {
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
            Unsupported procedure style
          </div>
        );
    }
  };

  if (procedureStyle === "FLOW") {
    return (
      <Card className="min-h-[600px] overflow-hidden animate-fade-from-top">
        {renderEditor()}
      </Card>
    );
  }

  return (
    <Card className="p-6 min-h-[600px] animate-fade-from-top">
      {renderEditor()}
    </Card>
  );
}
