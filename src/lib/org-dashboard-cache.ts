import { cacheLife, cacheTag } from "next/cache";

/** Invalidated by `pnpm demo:reset` after the demo org is re-seeded. */
export const DEMO_ORG_CACHE_TAG = "demo";

/**
 * Call from `"use cache"` functions that take `orgId`. Demo org gets multi-day cache
 * windows; other orgs keep the default short profile.
 */
export function applyOrgDashboardCachePolicy(orgId: string) {
  cacheTag(`org-dashboard-${orgId}`);
  if (process.env.DEMO_ORG_ID && orgId === process.env.DEMO_ORG_ID) {
    cacheTag(DEMO_ORG_CACHE_TAG);
    cacheLife({
      stale: 86_400,
      revalidate: 86_400,
      expire: 604_800,
    });
  } else {
    cacheLife("minutes");
  }
}
