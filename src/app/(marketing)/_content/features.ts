import type { Feature } from "./types";

export const features = [
  {
    id: "single-source",
    title: "One home for procedures",
    description:
      "Keep team runbooks, checklists, and updates in a single structured workspace instead of scattered docs.",
  },
  {
    id: "access",
    title: "Role-aware access",
    description:
      "Share the right level of detail with operators, leads, and admins without duplicating content.",
  },
  {
    id: "change",
    title: "Change you can trace",
    description:
      "Placeholder — highlight audit trails, versioning, or approvals when product copy lands in PR 3.",
  },
  {
    id: "integrations",
    title: "Fits your stack",
    description:
      "Placeholder — call out integrations, SSO, or exports once finalized for launch messaging.",
  },
] as const satisfies readonly Feature[];
