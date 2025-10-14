import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { eventCreateOrganization } from "@/features/onboarding/events/event-create-organization";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    eventCreateOrganization
  ],
});