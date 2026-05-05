"use server";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { getRedis } from "./redis";

export async function aiLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(10, "1m"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV}:ai`,
  });
}

export async function createLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(20, "1m"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV}:create`,
  });
}

export async function createProcedureImportLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(100, "1m"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV}:create`,
  });
}

export async function getLimitByUser(
  limiter: Ratelimit,
  userId: string | undefined,
  purpose: string,
) {
  return limiter.limit(`${purpose}:${userId}`);
}
