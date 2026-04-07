import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { eventCreateOrganization } from "@/features/onboarding/events/event-create-organization";
import { eventExportOrgAudit } from "@/inngest/functions/export-org-audit";
import { eventImportProcedure } from "@/inngest/functions/import-procedure";
import { eventProcedureRollout } from "@/features/procedures/events/procedure-rollout";

export const { GET, PUT, POST } = serve({
  client: inngest,
  functions: [
    eventCreateOrganization,
    eventExportOrgAudit,
    eventImportProcedure,
    eventProcedureRollout,
  ],
});
