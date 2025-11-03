import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Circle, Square, Diamond, CircleDot, Network, Download, AlertCircle } from "lucide-react";
import { FlowNodeType } from "../flow-editor";

type FlowToolbarProps = {
  onAddNode: (type: FlowNodeType) => void;
  onAutoLayout?: () => void;
  onExport?: () => void;
  onValidate?: () => void;
  className?: string;
};

export function FlowToolbar({ 
  onAddNode, 
  onAutoLayout, 
  onExport, 
  onValidate,
  className 
}: FlowToolbarProps) {
  return (
    <Card className={`p-2 flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddNode("start")}
        title="Add Start Node"
      >
        <Circle className="w-4 h-4 mr-1" />
        Start
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddNode("step")}
        title="Add Step"
      >
        <Square className="w-4 h-4 mr-1" />
        Step
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddNode("decision")}
        title="Add Decision"
      >
        <Diamond className="w-4 h-4 mr-1" />
        Decision
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddNode("end")}
        title="Add End Node"
      >
        <CircleDot className="w-4 h-4 mr-1" />
        End
      </Button>

      {(onAutoLayout || onExport || onValidate) && (
        <Separator orientation="vertical" className="h-8" />
      )}

      {onAutoLayout && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAutoLayout}
          title="Auto-arrange nodes"
        >
          <Network className="w-4 h-4 mr-1" />
          Auto-Layout
        </Button>
      )}

      {onValidate && (
        <Button
          variant="outline"
          size="sm"
          onClick={onValidate}
          title="Check for issues"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Validate
        </Button>
      )}

      {onExport && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          title="Export as PNG"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      )}
    </Card>
  );
}
