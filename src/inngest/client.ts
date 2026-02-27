import type { EventCreateOrganization } from "@/features/onboarding/events/event-create-organization";
import { EventSchemas, Inngest } from "inngest";
import { EventImportProcedure } from "./functions/import-procedure";

type Events = {
  "onboarding/create-organization": EventCreateOrganization;
  "procedure/import-file": EventImportProcedure;
};

export const inngest = new Inngest({
  id: "navis-docs",
  schemas: new EventSchemas().fromRecord<Events>(),
});
