const FALLBACK_IP = "unknown";

function firstForwardedIp(value: string): string | null {
  const ip = value.split(",")[0]?.trim();
  return ip || null;
}

function lastForwardedIp(value: string): string | null {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.at(-1) ?? null;
}

/**
 * Resolve the client IP for rate limiting and abuse controls.
 *
 * Never trusts client-supplied `x-forwarded-for` unless the deployment is
 * behind a known trusted proxy (Vercel, Cloudflare, or TRUSTED_PROXY /
 * AUTH_TRUST_HOST for self-hosted reverse proxies).
 */
export function getClientIpFromHeaders(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const ip = firstForwardedIp(vercelIp);
    if (ip) return ip;
  }

  const trustedProxy =
    process.env.VERCEL === "1" ||
    process.env.TRUSTED_PROXY === "true" ||
    process.env.AUTH_TRUST_HOST === "true";

  if (!trustedProxy) return FALLBACK_IP;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) return FALLBACK_IP;

  if (process.env.VERCEL === "1") {
    return firstForwardedIp(forwarded) ?? FALLBACK_IP;
  }

  return lastForwardedIp(forwarded) ?? FALLBACK_IP;
}
