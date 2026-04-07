
export const AUDIT_EXPORTS_BUCKET =
  process.env.SUPABASE_PROCEDURE_AUDITS_BUCKET ?? "audit-exports";

export function auditExportObjectPath(orgId: string, jobId: string): string {
  return `orgs/${orgId}/audit-exports/${jobId}.json`;
}

export const AUDIT_EXPORT_SIGNED_URL_TTL_SECONDS = 120;
