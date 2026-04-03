"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { viewProcedurePath } from "@/app/paths";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, FolderIcon } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { Skeleton } from "@/components/ui/skeleton";

type ProcedureSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ProcedureSearchResultsSkeleton() {
  return (
    <CommandGroup heading="Procedures">
      {Array.from({ length: 4 }).map((_, index) => (
        <CommandItem
          key={`procedure-search-skeleton-${index}`}
          value={`loading-${index}`}
          disabled
          className="pointer-events-none"
        >
          <Skeleton className="mr-2 h-4 w-4 rounded-sm" />
          <div className="flex flex-col flex-1 gap-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="ml-auto h-3 w-16" />
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export function ProcedureSearchDialog({
  open,
  onOpenChange,
}: ProcedureSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { departmentId, teamId } = useProcedureRouteContext();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const { data, isLoading } = trpc.procedures.searchProcedures.useQuery(
    { teamId, query: debouncedQuery },
    {
      enabled: debouncedQuery.trim().length > 0,
      staleTime: 1000 * 60,
    },
  );

  const results = data?.data ?? [];

  const handleSelect = useCallback(
    (procedureId: string) => {
      onOpenChange(false);
      router.push(viewProcedurePath(departmentId, teamId, procedureId));
      setTimeout(() => {
        setQuery("");
      }, 100);
    },
    [departmentId, router, teamId, onOpenChange],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Procedures"
      description="Find and navigate to procedures"
      className="top-[25%]"
    >
      <CommandInput
        placeholder="Search procedures by title..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[300px]
    overflow-y-auto
    transition-[max-height]
    duration-600
    ease-out py-2">
        {isLoading ? (
          <ProcedureSearchResultsSkeleton />
        ) : (
          <>
            <CommandEmpty>
              {query.trim().length > 0
                ? "No procedures found."
                : "Start typing to search procedures..."}
            </CommandEmpty>
            {results.length > 0 && (
              <CommandGroup heading="Procedures">
                {results.map((procedure) => (
                  <CommandItem
                    key={procedure.id}
                    value={procedure.title}
                    onSelect={() => handleSelect(procedure.id)}
                  >
                    <FileText className="mr-2 size-4" />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{procedure.title}</span>
                      {procedure.description && (
                        <span className="text-xs text-muted-foreground">
                          {procedure.description}
                        </span>
                      )}
                    </div>
                    {procedure.category && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <FolderIcon className="size-3" />
                        {procedure.category.name}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
