"use server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = Redis.fromEnv();

export async function authLimiter() {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10s"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV}:auth`,
  });
}

export async function deleteLimiter() {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "30s"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV}:delete`,
  });
}

export async function aiLimiter() {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1m"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV}:ai`,
  });
}

export async function createLimiter() {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1m"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV}:create`,
  });
}

export async function getLimitByIp(limiter: Ratelimit, purpose: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0]!.trim();
  return limiter.limit(`${purpose}:${ip}`);
}

export async function getLimitByUser(
  limiter: Ratelimit,
  userId: string,
  purpose: string
) {
  return limiter.limit(`${purpose}:${userId}`);
}
