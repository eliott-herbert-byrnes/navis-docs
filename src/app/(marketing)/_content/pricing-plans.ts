import { signInPath } from "@/app/paths";

import type { PricingPlan } from "./types";

export const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    planSlug: "starter",
    blurb: "TODO: Seat limits and feature list.",
  },
  {
    id: "team",
    name: "Team",
    planSlug: "team",
    blurb: "TODO: Team workflows and support tier.",
  },
  {
    id: "scale",
    name: "Scale",
    planSlug: "scale",
    blurb: "TODO: Enterprise controls and SLAs.",
  },
] as const satisfies readonly PricingPlan[];

export function subscriptionSignInHref(planSlug: string) {
  const callbackUrl = `/subscription?plan=${planSlug}`;
  return `${signInPath()}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
