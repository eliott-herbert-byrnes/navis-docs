import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";

export function EndNode({ data }: { data: { label: string } }) {
  return (
    <Card className="px-4 py-2 rounded-full bg-red-100 border-red-500 min-w-[100px]">
      <Handle type="target" position={Position.Top} />
      <div className="text-center font-semibold text-red-800">{data.label}</div>
    </Card>
  );
}
