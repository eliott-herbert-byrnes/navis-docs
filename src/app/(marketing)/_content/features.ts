import { Bot, GitCompareArrows, History, Inbox, Lightbulb, Megaphone, StarIcon, Users } from "lucide-react";
import type { Feature } from "./types";

export const features = [
  {
    id: "audit-trails",
    icon: History,
    title: "Audit Trials",
    description:
      "Every action recorded with who, what, and when.",
  },
  {
    id: "ai-search",
    icon: Bot,
    title: "AI Search",
    description:
      "Ask a question in plain English and get an answer sourced directly.",
  },
  {
    id: "version-control",
    icon: GitCompareArrows,
    title: "Version Control",
    description:
      "Every change is tracked automatically. Restore state with a single action.",
  },
  {
    id: "error-reporting",
    icon: Inbox,
    title: "Error Reporting",
    description:
      "Flag outdated or incorrect procedures directly from the page.",
  },
  {
    id: "idea-pipeline",
    icon: Lightbulb,
    title: "Idea Pipeline",
    description:
      "Crowdsource improvements from the people who follow procedures every day.",
  },
  {
    id: "role-based-access",
    icon: Users,
    title: "Role Based Access",
    description:
      "Owners, admins, and members each see exactly what they need.",
  },
  {
    id: "favorites",
    icon: StarIcon,
    title: "Favorites",
    description:
      "Pin the procedures you reach for most.",
  },
  {
    id: "announcements",
    icon: Megaphone,
    title: "Announcements",
    description:
      "Push targeted updates to specific departments or teams.",
  },

] as const satisfies readonly Feature[];
