"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { ProcedureSearchDialog } from "./procedure-search-dialog";

export function ProcedureSearchButton() {
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
      <div className="">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground max-w-[250px] mt-1 ml-2"
          onClick={() => setOpen(true)}
        >
          <Search className="size-4" />
          <span className="truncate">Search Procedures...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-secondary px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <ProcedureSearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
