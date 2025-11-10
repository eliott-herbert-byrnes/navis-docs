import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DecisionNode({
  data,
  isConnectable,
}: {
  data: {
    label: string;
    onUpdateData?: (newData: { label?: string }) => void;
    onDelete?: () => void;
  };
  isConnectable: boolean;
}) {
  return (
    <div className="relative group">
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
          className="absolute -top-4 left-1/2 -translate-x-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full z-10"
          title="Delete node"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      <Card className="p-4 rotate-45 w-32 h-32 bg-yellow-50 border-yellow-500">
        <div className="-rotate-45 text-center font-semibold text-xs flex items-center justify-center h-full text-black">
          {data.onUpdateData ? (
            <Input
              value={data.label}
              onChange={(e) => {
                data.onUpdateData?.({ label: e.target.value });
              }}
              className="text-center text-xs h-6 px-1 border-0 bg-transparent focus-visible:ring-1 text-black placeholder:text-gray-500"
              placeholder="Decision?"
            />
          ) : (
            data.label
          )}
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        isConnectable={isConnectable}
        style={{ right: '-4px' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="no"
        isConnectable={isConnectable}
        style={{ left: '-4px' }}
      />
    </div>
  );
}
