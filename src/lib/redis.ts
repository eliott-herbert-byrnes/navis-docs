import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Upstash env vars missing (required at runtime).");
  }

  if (!_redis) _redis = new Redis({ url, token });
  return _redis;
}
