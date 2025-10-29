import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";

export function StartNode({ data }: { data: { label: string } }) {
  return (
    <Card className="px-4 py-2 rounded-full bg-green-100 border-green-500 min-w-[100px]">
      <div className="text-center font-semibold text-green-800">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}
