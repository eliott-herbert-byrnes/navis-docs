"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { viewProcessPath } from "@/app/paths";
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

type ProcessSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  teamId: string;
};

export function ProcessSearchDialog({
  open,
  onOpenChange,
  departmentId,
  teamId,
}: ProcessSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data, isLoading } = trpc.process.searchProcesses.useQuery(
    { teamId, query },
    {
      enabled: query.trim().length > 0,
      staleTime: 1000 * 60,
    },
  );

  const results = data?.data ?? [];

  const handleSelect = useCallback(
    (processId: string) => {
      onOpenChange(false);
      router.push(viewProcessPath(departmentId, teamId, processId));
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
      title="Search Processes"
      description="Find and navigate to processes"
      className="top-[12.5%]"
    >
      <CommandInput
        placeholder="Search processes by title..."
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
                ? "No processes found."
                : "Start typing to search processes..."}
            </CommandEmpty>
            {results.length > 0 && (
              <CommandGroup heading="Processes">
                {results.map((process) => (
                  <CommandItem
                    key={process.id}
                    value={process.title}
                    onSelect={() => handleSelect(process.id)}
                  >
                    <FileText className="mr-2 size-4" />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{process.title}</span>
                      {process.description && (
                        <span className="text-xs text-muted-foreground">
                          {process.description}
                        </span>
                      )}
                    </div>
                    {process.category && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <FolderIcon className="size-3" />
                        {process.category.name}
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
