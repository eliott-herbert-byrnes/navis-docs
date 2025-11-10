import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function StepNode({
  data,
  isConnectable,
}: {
  data: {
    label: string;
    description?: string;
    onUpdateData?: (newData: { label?: string; description?: string }) => void;
    onDelete?: () => void;
  };
  isConnectable: boolean;
}) {
  return (
    <Card className="p-3 min-w-[200px] relative group">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      {data.onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={data.onDelete}
          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
          title="Delete node"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      <div className="space-y-2">
        <Input
          value={data.label}
          onChange={(e) => {
            data.onUpdateData?.({ label: e.target.value });
          }}
          className="font-semibold"
          placeholder="Step name..."
        />
        <Textarea
          value={data.description || ""}
          onChange={(e) => {
            data.onUpdateData?.({ description: e.target.value });
          }}
          placeholder="Description..."
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </Card>
  );
}
