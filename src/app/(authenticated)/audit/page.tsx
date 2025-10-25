"use server";
import { homePath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AuditLogViewer } from "@/features/audit/components/audit-log-viewer";
import { getAuditLogs } from "@/features/audit/utils/audit";

const AuditPage = async () => {
  const user = await getSessionUser();

  const isAdmin = await isOrgAdminOrOwner(user!.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user!.userId);
  if (!org) redirect(homePath());

  const logs = await getAuditLogs(org.id);

  return (
    <>
      <Heading
        title="Audit Logs"
        description="View your audit logs"
      />
      <Suspense fallback={<Spinner />}>
        <AuditLogViewer logs={logs} />
      </Suspense>
    </>
  );
};

export default AuditPage;
