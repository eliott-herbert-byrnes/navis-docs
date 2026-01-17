"use server";

import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { getRedis } from "@/lib/redis";

let _base: Ratelimit | null = null;

function getBase() {
  if (!_base) {
    _base = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "10s"),
      analytics: true,
      prefix: `rl:${process.env.NODE_ENV === "production" ? "prod" : "dev"}:auth`,
    });
  }
  return _base;
}

export async function limiter(scope: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0]!.trim();
  return getBase().limit(`${scope}:${ip}`);
}
