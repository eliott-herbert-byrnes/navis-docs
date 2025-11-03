"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { searchProcesses } from "../queries/search-processes";
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

type ProcessSearchResult = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  category: {
    name: string;
  } | null;
};

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
  const [results, setResults] = useState<ProcessSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const data = await searchProcesses(teamId, query);
          setResults(data);
        } catch (error) {
          console.error("Error searching processes:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, teamId]);

  const handleSelect = useCallback(
    (processId: string) => {
      onOpenChange(false);
      router.push(viewProcessPath(departmentId, teamId, processId));
      setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 100);
    },
    [departmentId, router, teamId, onOpenChange]
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
        {isSearching ? (
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
