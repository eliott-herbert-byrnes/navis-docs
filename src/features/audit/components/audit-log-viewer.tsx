import { EmptyState } from "@/components/empty-state";
import { Separator } from "@/components/ui/separator";
import { getUserById } from "@/lib/auth";
import { format, formatDistanceToNow } from "date-fns";
import { User } from "next-auth";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  at: Date;
  beforeJSON: any;
  afterJSON: any;
  actorId: string;
};

type AuditLogViewerProps = {
  logs: AuditLog[];
};

export async function AuditLogViewer({ logs }: AuditLogViewerProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        title="No audit logs found"
        body="There are no audit logs matching your filters. Try adjusting your search or filters."
      />
    );
  }

  const users = await Promise.all(logs.map((log) => getUserById(log.actorId)));
  
  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold">{log.action}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {log.entityType}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(log.at), { addSuffix: true })}
            </span>
          </div>
          <Separator />
          <div className="flex flex-col text-sm justify-between items-start">
            <span className="text-muted-foreground">
              <strong>User:</strong>{" "}
              {users.find((user) => user?.id === log.actorId)?.name ??
                "Unknown"}
            </span>
            <span className="text-muted-foreground">
              <strong>UserId:</strong> {log.actorId}
            </span>
            <span className="text-muted-foreground">
              <strong>Entity:</strong> {log.entityType}
            </span>
            <span className="text-muted-foreground">
              <strong>Action:</strong> {log.action}
            </span>
          </div>

          {log.beforeJSON && (
            <div>
              <p className="text-sm font-medium">Before:</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto line-clamp-15">
                {JSON.stringify(log.beforeJSON, null, 2)}
              </pre>
            </div>
          )}

          <Separator />

          {log.afterJSON && (
            <div>
              <p className="text-sm font-medium">After:</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto line-clamp-15">
                {JSON.stringify(log.afterJSON, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
