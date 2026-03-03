import { inngest } from "@/inngest/client";
import { RolloutRoleFilter } from "@prisma/client";

export type ProcedureRolloutEvent = {
  data: {
    rolloutId: string;
    procedureId: string;
    versionId: string;
    orgId: string;
    notifyRoleFilter: RolloutRoleFilter;
    emailOnPublish: boolean;
    emailRoleFilter: RolloutRoleFilter | null;
    newsOnPublish: boolean;
    procedureTitle: string;
    teamId: string;
  };
};

export const eventProcedureRollout = inngest.createFunction(
  {
    id: "procedure-roll-out",
  },
  {
    event: "procedure/roll-out",
  },
  async ({ event }) => {
    const {
      rolloutId,
      procedureId,
      versionId,
      orgId,
      notifyRoleFilter,
      emailOnPublish,
      emailRoleFilter,
      newsOnPublish,
      procedureTitle,
      teamId,
    } = event.data;

    // For Phase 2.4 you can keep this minimal (log-only),
    // and you’ll flesh it out in Phase 6:
    //
    // - If emailOnPublish: load in-scope users based on emailRoleFilter and orgId, send batched emails.
    // - If newsOnPublish: create a NewsPost row for teamId using procedureTitle, etc.
    //
    return { eventId: rolloutId };
  },
);
