"use server";

import { headers } from "next/headers";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { getRedis } from "@/lib/redis";

let _authLimiter: RateLimiterRedis | null = null;

function getAuthLimiter(): RateLimiterRedis {
  if (!_authLimiter) {
    _authLimiter = new RateLimiterRedis({
      storeClient: getRedis(),
      keyPrefix: `rl:${process.env.NODE_ENV === "production" ? "prod" : "dev"}:auth`,
      points: 10,
      duration: 10,
    });
  }
  return _authLimiter;
}

export async function limiter(scope: string): Promise<{ success: boolean }> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0]!.trim();
  try {
    await getAuthLimiter().consume(`${scope}:${ip}`);
    return { success: true };
  } catch {
    return { success: false };
  }
}
