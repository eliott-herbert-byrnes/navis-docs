import { FileText, LayoutList, Network, Workflow } from "lucide-react";
import type { HeroFeatures } from "./types";

export const HeroFeature = [
  {
    id: "file-text",
    icon: FileText,
    title: "Rich Text",
    description:
      "A full-featured editor for narrative procedures, detailed context, and anything that doesn't fit a template. Free-form and flexible.",
  },
  {
    id: "visual-flowchart",
    icon: Network,
    title: "Visual Flowcharts",
    description:
      "Map decision points, handoffs, and escalation paths with a drag-and-drop builder. Ideal for cross-team workflows that need a visual.",
  },
  {
    id: "decision-tree",
    icon: Workflow,
    title: "Decision Trees",
    description:
      "Guide operators through branching scenarios step by step. Reduces errors in high-stakes, time-pressured situations..",
  },
  {
    id: "sequential-steps",
    icon: LayoutList,
    title: "Sequential Steps",
    description:
      "Linear, numbered procedures with expandable detail sections. The go-to format for onboarding checklists and repeatable tasks.",
  },
] as const satisfies readonly HeroFeatures[];
