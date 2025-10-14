import type { EventCreateOrganization } from "@/features/onboarding/events/event-create-organization";
import { EventSchemas, Inngest } from "inngest";

type Events = {
  "onboarding/create-organization": EventCreateOrganization;
};

export const inngest = new Inngest({
  id: "navis-docs",
  schemas: new EventSchemas().fromRecord<Events>(),
});
