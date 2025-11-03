"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { ProcessSearchDialog } from "./process-search-dialog";

type ProcessSearchButtonProps = {
  departmentId: string;
  teamId: string;
};

export function ProcessSearchButton({
  departmentId,
  teamId,
}: ProcessSearchButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span>Search Processes...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <ProcessSearchDialog
        open={open}
        onOpenChange={setOpen}
        departmentId={departmentId}
        teamId={teamId}
      />
    </>
  );
}
