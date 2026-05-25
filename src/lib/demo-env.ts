const DEMO_MODE_VARS = [
  "NEXT_PUBLIC_DEMO_HOST",
  "DEMO_ORG_ID",
  "DEMO_USER_ID",
  "DEMO_MEMBER_USER_ID",
] as const;

function envIsSet(name: string): boolean {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

function hostnameFromUrl(url: string, envName: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    throw new Error(`[demo-env] ${envName} must be a valid URL (got "${url}")`);
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `[demo-env] ${name} is required when NEXT_PUBLIC_DEMO_MODE=true`,
    );
  }
  return value;
}

/**
 * Validates demo vs production env at build/start. Imported from next.config.ts so
 * misconfiguration fails loudly instead of enabling a silent auth bypass.
 */
export function validateDemoEnv(): void {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoMode) {
    for (const name of DEMO_MODE_VARS) {
      if (envIsSet(name)) {
        throw new Error(
          `[demo-env] ${name} must not be set when NEXT_PUBLIC_DEMO_MODE is not "true"`,
        );
      }
    }
    return;
  }

  const demoHost = requireEnv("NEXT_PUBLIC_DEMO_HOST");
  const appUrl = requireEnv("NEXT_PUBLIC_APP_URL");
  requireEnv("DEMO_ORG_ID");
  requireEnv("DEMO_USER_ID");

  const appHostname = hostnameFromUrl(appUrl, "NEXT_PUBLIC_APP_URL");
  if (appHostname !== demoHost) {
    throw new Error(
      `[demo-env] NEXT_PUBLIC_APP_URL host (${appHostname}) must match NEXT_PUBLIC_DEMO_HOST (${demoHost})`,
    );
  }
}
