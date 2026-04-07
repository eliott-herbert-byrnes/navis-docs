"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { getSessionContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuditLogViewer } from "@/features/audit/components/audit-log-viewer";
import {
  AuditEntityType,
  getAuditLogsWithCount,
  normalizeAuditExportDateRange,
} from "@/features/audit/utils/audit";
import { AuditSearch } from "@/features/audit/components/audit-search";
import { AuditPagination } from "@/features/audit/components/audit-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading } from "@/components/ui/Heading";
import { JsonObject } from "@prisma/client/runtime/client";
import { PageContainer } from "@/components/ui/page-container";

function AuditLogViewerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-4 w-36" />
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-md border p-4 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

type AuditPageProps = {
  searchParams: Promise<{
    search?: string;
    entityType?: AuditEntityType;
    startDate?: string;
    endDate?: string;
    page?: string;
    pageSize?: string;
  }>;
};

const AuditPage = async ({ searchParams }: AuditPageProps) => {
  // Authentication & authorization
  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};

  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  // Parse all search params
  const params = await searchParams;

  // Filter params
  const search = params.search;
  const entityType = params.entityType;

  // Date range: same UTC normalization as async JSON export (calendar end = end-of-day UTC)
  const { startDate, endDate } = normalizeAuditExportDateRange({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  // Pagination params - validate and provide defaults
  const page = Math.max(1, Number(params.page) || 1); // Ensure minimum page 1
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
    <PageContainer>
      <Heading
        title="Audit Logs"
        description="View the audit logs for your organization"
      />

      {/* Search and filters */}
      <div className="mb-4">
        <AuditSearch />
      </div>

      {/* Audit logs with pagination */}
      <Suspense fallback={<AuditLogViewerSkeleton />}>
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
    </PageContainer>
  );
};

export default AuditPage;
