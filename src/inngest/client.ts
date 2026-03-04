import type { EventCreateOrganization } from "@/features/onboarding/events/event-create-organization";
import { EventSchemas, Inngest } from "inngest";
import { EventImportProcedure } from "./functions/import-procedure";
import type { ProcedureRolloutEvent } from "@/features/procedures/events/procedure-rollout";

type Events = {
  "onboarding/create-organization": EventCreateOrganization;
  "procedure/import-file": EventImportProcedure;
  "procedure/roll-out": ProcedureRolloutEvent;
};

export const inngest = new Inngest({
  id: "navis-docs",
  eventKey: process.env.INNGEST_DEV,
  schemas: new EventSchemas().fromRecord<Events>(),
});
