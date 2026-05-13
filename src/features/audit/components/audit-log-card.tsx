"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { JsonObject } from "@prisma/client/runtime/client";
import { Skeleton } from "@/components/ui/skeleton";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  at: Date;
  beforeJSON: JsonObject | null;
  afterJSON: JsonObject | null;
  actorId: string;
};

type AuditLogCardProps = {
  log: AuditLog;
  userName: string;
};

function AuditLogCardSkeleton() {
  return (
    <Card className="w-full shadow-none border-1 p-4 border-sm">
      <CardHeader className="py-0 px-0 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <Separator className="my-4" />
      <CardContent className="pt-0 space-y-3 m-0 px-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

export function AuditLogCard({ log, userName }: AuditLogCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Generate markdown export format
  const generateMarkdown = () => {
    return `# ${log.action}

**User:** ${userName} (${log.actorId})
**Entity:** ${log.entityType} (${log.entityId})
**Action:** ${log.action}
**Time:** ${format(new Date(log.at), "yyyy-MM-dd HH:mm:ss")}

## Before
\`\`\`json
${log.beforeJSON ? JSON.stringify(log.beforeJSON, null, 2) : "null"}
\`\`\`

## After
\`\`\`json
${log.afterJSON ? JSON.stringify(log.afterJSON, null, 2) : "null"}
\`\`\`
`;
  };

  // Generate JSON export format
  const generateJSON = () => {
    return JSON.stringify(
      {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actorId: log.actorId,
        userName: userName,
        timestamp: new Date(log.at).toISOString(),
        before: log.beforeJSON,
        after: log.afterJSON,
      },
      null,
      2,
    );
  };

  // Copy to clipboard with toast notification
  const handleExport = async (format: "markdown" | "json") => {
    try {
      const content =
        format === "markdown" ? generateMarkdown() : generateJSON();
      await navigator.clipboard.writeText(content);
      toast.success(`Copied as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(
        "Failed to copy to clipboard, check permissions or try again",
      );
    }
  };

  return (
    <Suspense fallback={<AuditLogCardSkeleton />}>
      <Card className="w-full shadow-none border-1 p-4 border-sm">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {/* Header - Always Visible */}
          <CardHeader className="py-0 px-0">
            <div className="flex items-center justify-between gap-1 mt-1">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Action Title */}
                <span className="font-semibold text-md truncate">
                  {formatAction(log.action)}
                </span>

                {/* Username */}
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  •
                </span>
                <span className="text-sm text-muted-foreground truncate hidden sm:inline">
                  {userName}
                </span>

                {/* Relative Time */}
                <span className="text-sm text-muted-foreground hidden md:inline">
                  •
                </span>
                <span className="text-sm text-muted-foreground hidden md:inline whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.at), { addSuffix: true })}
                </span>
              </div>

              {/* Collapsible Trigger Button */}
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Toggle details"
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Export options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("markdown")}>
                    Copy as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    Copy as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile-only: Show username and time below on small screens */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden mt-1 sm:ml-11">
              <span>{userName}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(log.at), { addSuffix: true })}
              </span>
            </div>
          </CardHeader>

          {/* Collapsible Content - Shows when expanded */}
          <CollapsibleContent>
            <Separator />
            <CardContent className="pt-4 space-y-4 m-0 px-1 max-w-80 sm:max-w-full">
              {/* Audit Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">User:</span>{" "}
                  <span>{userName}</span>
                </div>
                <div>
                  <span className="font-medium">User ID:</span>{" "}
                  <span>{log.actorId}</span>
                </div>
                <div>
                  <span className="font-medium">Entity:</span>{" "}
                  <span>
                    {log.entityType.charAt(0) +
                      log.entityType.slice(1).toLowerCase()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Entity ID:</span>{" "}
                  <span>{log.entityId}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Action:</span>{" "}
                  <span>{log.action}</span>
                </div>
              </div>

              {/* Before JSON */}
              {log.beforeJSON && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Before:</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-60">
                    {JSON.stringify(log.beforeJSON, null, 2)}
                  </pre>
                </div>
              )}

              {/* After JSON */}
              {log.afterJSON && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">After:</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-60">
                    {JSON.stringify(log.afterJSON, null, 2)}
                  </pre>
                </div>
              )}

              {/* Show message if both are null */}
              {!log.beforeJSON && !log.afterJSON && (
                <p className="text-sm text-muted-foreground italic">
                  No JSON data available for this audit log.
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </Suspense>
  );
}
