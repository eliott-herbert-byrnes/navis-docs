import { headers } from "next/headers";

/** Host header check for tRPC / raw Request (same rule as {@link isDemoContext}). */
export function isDemoHost(host: string | null | undefined): boolean {
  const demoHost = process.env.NEXT_PUBLIC_DEMO_HOST ?? "";
  return demoHost.length > 0 && host === demoHost;
}

export async function isDemoContext(): Promise<boolean> {
  const host = (await headers()).get("host") ?? "";
  return isDemoHost(host);
}