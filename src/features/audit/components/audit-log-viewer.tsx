"use client";

import { formatDistanceToNow } from "date-fns";

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

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div
          key={log.id}
          className="border rounded-lg p-4 space-y-2"
        >
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
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">UserId: {log.actorId}</span>
          </div>
          
          {log.beforeJSON && (
            <div>
              <p className="text-sm font-medium">Before:</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(log.beforeJSON, null, 2)}
              </pre>
            </div>
          )}
          
          {log.afterJSON && (
            <div>
              <p className="text-sm font-medium">After:</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(log.afterJSON, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}