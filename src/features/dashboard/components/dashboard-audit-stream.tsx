import { EmptyState } from "@/components/ui/empty-state";
import { AuditLogCard } from "@/features/audit/components/audit-log-card";
import { getCachedDashboardAuditPreview } from "@/features/dashboard/queries/dashboard-audit-preview";
import { getUserById } from "@/lib/auth";
import { JsonObject } from "@prisma/client/runtime/client";

export async function DashboardAuditStream({ orgId }: { orgId: string }) {
  const { logs: rawLogs } = await getCachedDashboardAuditPreview(orgId);

  const logs = rawLogs.map((log) => ({
    ...log,
    beforeJSON: (typeof log.beforeJSON === "object"
      ? log.beforeJSON
      : null) as JsonObject | null,
    afterJSON: (typeof log.afterJSON === "object"
      ? log.afterJSON
      : null) as JsonObject | null,
  }));

  if (logs.length === 0) {
    return (
      <EmptyState
        title="No audit logs found"
        body="There are no audit logs matching your filters. Try adjusting your search or filters."
      />
    );
  }

  const uniqueActorIds = Array.from(new Set(logs.map((log) => log.actorId)));
  const users = await Promise.all(uniqueActorIds.map((id) => getUserById(id)));

  const userMap = new Map(
    users.map((user) => [user?.id, user?.name ?? "Unknown"]),
  );

  return (
    <div className="space-y-4 mb-8">
      {logs.map((log) => (
        <AuditLogCard
          key={log.id}
          log={log}
          userName={userMap.get(log.actorId) ?? "Unknown"}
        />
      ))}
    </div>
  );
}
