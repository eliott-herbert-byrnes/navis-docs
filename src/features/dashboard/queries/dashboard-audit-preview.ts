import { getAuditLogsWithCount } from "@/features/audit/utils/audit";
import { applyOrgDashboardCachePolicy } from "@/lib/org-dashboard-cache";

export async function getCachedDashboardAuditPreview(orgId: string) {
  "use cache";
  applyOrgDashboardCachePolicy(orgId);
  return getAuditLogsWithCount(orgId, { limit: 5 });
}
