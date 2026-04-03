import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 rounded-sm" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-2 border rounded-lg"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
