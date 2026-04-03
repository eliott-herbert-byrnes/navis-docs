import { EmptyState } from "@/components/ui/empty-state";
import { AuditLogCard } from "@/features/audit/components/audit-log-card";
import { getAuditLogsWithCount } from "@/features/audit/utils/audit";
import { getSessionContext, getUserById } from "@/lib/auth";
import { JsonObject } from "@prisma/client/runtime/client";

export async function DashboardAuditStream() {
    const ctx = await getSessionContext();
    const orgId = ctx?.org?.id;
    if (!orgId) {
        return (
            <EmptyState
                title="No audit logs found"
                body="There are no audit logs matching your filters. Try adjusting your search or filters."
            />
        );
    }

    const { logs: rawLogs, } = await getAuditLogsWithCount(orgId, {
        limit: 5,
    });

    // Transform JSON fields to ensure type safety
    const logs = rawLogs.map((log) => ({
        ...log,
        beforeJSON: (typeof log.beforeJSON === "object"
            ? log.beforeJSON
            : null) as JsonObject | null,
        afterJSON: (typeof log.afterJSON === "object"
            ? log.afterJSON
            : null) as JsonObject | null,
    }));

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
    const users = await Promise.all(uniqueActorIds.map((id) => getUserById(id)));

    // Create a lookup map for O(1) access
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