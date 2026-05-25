import { headers } from "next/headers";
import { dashboardPath } from "@/app/paths";

/** Host header check for tRPC / raw Request (same rule as {@link isDemoContext}). */
export function isDemoHost(host: string | null | undefined): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return false;
  const demoHost = process.env.NEXT_PUBLIC_DEMO_HOST ?? "";
  return demoHost.length > 0 && host === demoHost;
}

export async function isDemoContext(): Promise<boolean> {
  const host = (await headers()).get("host") ?? "";
  return isDemoHost(host);
}

/**
 * Marketing iframe target (production only). Embeds the demo app dashboard, not the
 * marketing homepage — avoids nested iframes blocked by demo `frame-ancestors` CSP.
 */
export function getDemoIframeSrc(): string | null {
  const base = process.env.NEXT_PUBLIC_DEMO_URL?.trim();
  if (!base) return null;

  try {
    return new URL(dashboardPath(), base).href;
  } catch {
    return null;
  }
}
