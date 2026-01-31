"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
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

type ProcedureSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProcedureSearchDialog({
  open,
  onOpenChange,
}: ProcedureSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { departmentId, teamId } = useProcedureRouteContext();

  const { data, isLoading } = trpc.procedures.searchProcedures.useQuery(
    { teamId, query },
    {
      enabled: query.trim().length > 0,
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
      className="top-[12.5%]"
    >
      <CommandInput
        placeholder="Search procedures by title..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
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
