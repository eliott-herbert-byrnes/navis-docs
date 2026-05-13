import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full min-w-0 sm:col-span-14 sm:col-start-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
