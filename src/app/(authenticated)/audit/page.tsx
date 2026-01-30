"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuditLogViewer } from "@/features/audit/components/audit-log-viewer";
import { 
  AuditEntityType, 
  getAuditLogsWithCount  // Changed from getAuditLogs
} from "@/features/audit/utils/audit";
import { AuditSearch } from "@/features/audit/components/audit-search";
import { AuditPagination } from "@/features/audit/components/audit-pagination";
import { JsonObject } from "@prisma/client/runtime/library";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading } from "@/components/ui/Heading";

type AuditPageProps = {
  searchParams: Promise<{
    search?: string;
    entityType?: AuditEntityType;
    startDate?: string;     // NEW
    endDate?: string;       // NEW
    page?: string;          // NEW
    pageSize?: string;      // NEW
  }>;
};

const AuditPage = async ({ searchParams }: AuditPageProps) => {
  // Authentication & authorization
  const user = await getSessionUser();
  const { org, isAdmin } = await getUserOrgWithRole(user?.userId ?? "");
  
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  // Parse all search params
  const params = await searchParams;
  
  // Filter params
  const search = params.search;
  const entityType = params.entityType;
  
  // Date range params - convert ISO strings to Date objects
  const startDate = params.startDate 
    ? new Date(params.startDate) 
    : undefined;
  const endDate = params.endDate 
    ? new Date(params.endDate) 
    : undefined;
  
  // Pagination params - validate and provide defaults
  const page = Math.max(1, Number(params.page) || 1);  // Ensure minimum page 1
  const pageSize = Number(params.pageSize) || 10;

  // Fetch audit logs with count
  const { logs: rawLogs, totalCount } = await getAuditLogsWithCount(org.id, {
    search,
    entityType,
    startDate,
    endDate,
    limit: pageSize,
    offset: (page - 1) * pageSize,
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

  return (
    <>
      <Heading
        title="Audit Logs"
        description="View the audit logs for your organization"
      />

      {/* Search and filters */}
      <div className="px-1 mb-4">
        <AuditSearch />
      </div>

      {/* Audit logs with pagination */}
      <Suspense fallback={<Skeleton className="h-96" />}>
        <div className="space-y-4">
          <AuditLogViewer logs={logs} />
          
          {/* Only show pagination if there are logs */}
          {totalCount > 0 && (
            <AuditPagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={totalCount}
            />
          )}
        </div>
      </Suspense>
    </>
  );
};

export default AuditPage;