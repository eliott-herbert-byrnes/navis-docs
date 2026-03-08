"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLogCard } from "@/features/audit/components/audit-log-card";
import { trpc } from "@/trpc/client";
import { JsonObject } from "@prisma/client/runtime/client";

function toJsonObject(value: unknown): JsonObject | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }
  return null;
}

export function DashboardAuditStream() {
  const { data, isLoading } = trpc.audit.getRecent.useQuery(
    { limit: 5 },
    { refetchInterval: 30_000 },
  );

  if (isLoading) return <Skeleton className="h-48" />;

  return (
    <div className="space-y-2">
      {data?.logs.map((log) => (
        <AuditLogCard
          key={log.id}
          log={{
            ...log,
            beforeJSON: toJsonObject(log.beforeJSON),
            afterJSON: toJsonObject(log.afterJSON),
          }}
          userName="Unknown"
        />
      ))}
    </div>
  );
}