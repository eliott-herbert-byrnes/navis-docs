import { getUserById } from "@/lib/auth";
import { JsonObject } from "@prisma/client/runtime/library";
import { format } from "date-fns";
import { AuditLogCard } from "./audit-log-card";
import { EmptyState } from "@/components/ui/empty-state";

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

type AuditLogViewerProps = {
  logs: AuditLog[];
};

// Date separator component
function DateSeparator({ date }: { date: string }) {
  const dateObj = new Date(date);
  
  return (
    <div className="flex items-center gap-4 my-6 pt-3 first:mt-0">
      <div className="flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">
          {format(dateObj, "MMMM dd, yyyy")}
        </h3>
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export async function AuditLogViewer({ logs }: AuditLogViewerProps) {
  // Handle empty state
  if (logs.length === 0) {
    return (
      <EmptyState
        title="No audit logs found"
        body="There are no audit logs matching your filters. Try adjusting your search or filters."
      />
    );
  }

  // Fetch users efficiently - only unique actors
  const uniqueActorIds = Array.from(new Set(logs.map((log) => log.actorId)));
  const users = await Promise.all(
    uniqueActorIds.map((id) => getUserById(id))
  );

  // Create a lookup map for O(1) access
  const userMap = new Map(
    users.map((user) => [user?.id, user?.name ?? "Unknown"])
  );

  // Group logs by date (YYYY-MM-DD)
  const groupedLogs = logs.reduce((groups, log) => {
    const dateKey = format(new Date(log.at), "yyyy-MM-dd");
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(log);
    
    return groups;
  }, {} as Record<string, AuditLog[]>);

  // Get sorted date keys (newest first)
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-2">
      {sortedDates.map((dateKey) => (
        <div key={dateKey}>
          {/* Date separator header */}
          <DateSeparator date={dateKey} />
          
          {/* All logs for this date */}
          <div className="space-y-3">
            {groupedLogs[dateKey].map((log) => (
              <AuditLogCard
                key={log.id}
                log={log}
                userName={userMap.get(log.actorId) ?? "Unknown"}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}