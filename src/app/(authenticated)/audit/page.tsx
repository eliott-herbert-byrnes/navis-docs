"use server";
import { homePath, onboardingPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuditLogViewer } from "@/features/audit/components/audit-log-viewer";
import { AuditEntityType, getAuditLogs } from "@/features/audit/utils/audit";
import { AuditSearch } from "@/features/audit/components/audit-search";
import { JsonObject } from "@prisma/client/runtime/library";
import { Skeleton } from "@/components/ui/skeleton";

type AuditPageProps = {
  searchParams: Promise<{
    search?: string;
    entityType?: AuditEntityType;
  }>;
};

const AuditPage = async ({ searchParams }: AuditPageProps) => {
  const user = await getSessionUser();

  const {org, isAdmin} = await getUserOrgWithRole(user?.userId ?? "");
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(homePath());

  const params = await searchParams;
  const search = params.search;
  const entityType = params.entityType;
  const rawLogs = await getAuditLogs(org.id, undefined, search, {
    entityType,
  });
  
  const logs = rawLogs.map(log => ({
    ...log,
    beforeJSON: (typeof log.beforeJSON === 'object' ? log.beforeJSON : null) as JsonObject | null,
    afterJSON: (typeof log.afterJSON === 'object' ? log.afterJSON : null) as JsonObject | null,
  }));

  return (
    <>
      <Heading
        title="Audit Logs"
        description="View the audit logs for your organization"
      />

      <div className="px-1 mb-4">
        <AuditSearch />
      </div>
      <Suspense fallback={<Skeleton />}>
        <AuditLogViewer logs={logs} />
      </Suspense>
    </>
  );
};

export default AuditPage;
