"use server";

import { RateLimiterRedis } from "rate-limiter-flexible";
import { getRedis } from "./redis";

let _aiLimiter: RateLimiterRedis | null = null;
let _createLimiter: RateLimiterRedis | null = null;
let _procedureImportLimiter: RateLimiterRedis | null = null;

export async function aiLimiter(): Promise<RateLimiterRedis> {
  if (!_aiLimiter) {
    _aiLimiter = new RateLimiterRedis({
      storeClient: getRedis(),
      keyPrefix: `rl:${process.env.NODE_ENV}:ai`,
      points: 10,
      duration: 60,
    });
  }
  return _aiLimiter;
}

export async function createLimiter(): Promise<RateLimiterRedis> {
  if (!_createLimiter) {
    _createLimiter = new RateLimiterRedis({
      storeClient: getRedis(),
      keyPrefix: `rl:${process.env.NODE_ENV}:create`,
      points: 20,
      duration: 60,
    });
  }
  return _createLimiter;
}

export async function createProcedureImportLimiter(): Promise<RateLimiterRedis> {
  if (!_procedureImportLimiter) {
    _procedureImportLimiter = new RateLimiterRedis({
      storeClient: getRedis(),
      keyPrefix: `rl:${process.env.NODE_ENV}:create`,
      points: 100,
      duration: 60,
    });
  }
  return _procedureImportLimiter;
}

export async function getLimitByUser(
  limiter: RateLimiterRedis,
  userId: string | undefined,
  purpose: string,
): Promise<{ success: boolean }> {
  const key = `${purpose}:${userId ?? "anonymous"}`;
  try {
    await limiter.consume(key);
    return { success: true };
  } catch {
    return { success: false };
  }
}
