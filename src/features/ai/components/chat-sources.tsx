"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

interface Source {
  processId: string;
  title: string;
  url: string;
}

interface ChatSourcesProps {
  sources: Source[];
}

export function ChatSources({ sources }: ChatSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div className="border-t p-4 bg-muted/30">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Referenced Processes:
      </p>
      <div className="flex flex-col gap-1">
        {sources.map((source) => (
          <Button
            key={source.processId}
            variant="ghost"
            size="sm"
            className="justify-start h-auto py-2 px-2"
            asChild
          >
            <Link href={source.url}>
              <FileText className="h-3 w-3 mr-2 shrink-0" />
              <span className="text-xs truncate">{source.title}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
