"use server";
import { auditPath, homePath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AuditLogViewer } from "@/features/audit/components/audit-log-viewer";
import { AuditEntityType, getAuditLogs } from "@/features/audit/utils/audit";
import { AuditSearch } from "@/features/audit/components/audit-search";

type AuditPageProps = {
  searchParams: Promise<{
    search?: string;
    entityType?: AuditEntityType;
  }>;
};

const AuditPage = async ({ searchParams }: AuditPageProps) => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const isAdmin = await isOrgAdminOrOwner(user!.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user!.userId);
  if (!org) redirect(homePath());

  const params = await searchParams;
  const search = params.search;
  const entityType = params.entityType;
  const logs = await getAuditLogs(org.id, undefined, search, {
    entityType,
  });

  return (
    <>
      <Heading
        title="Audit Logs"
        description="View the audit logs for your organization"
      />

      <div className="px-1 mb-4">
        <AuditSearch />
      </div>
      <Suspense fallback={<Spinner />}>
        <AuditLogViewer logs={logs} />
      </Suspense>
    </>
  );
};

export default AuditPage;
