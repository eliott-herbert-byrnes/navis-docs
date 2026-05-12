import Redis from "ioredis";

let _client: Redis | null = null;

export function getRedis(): Redis {
  if (_client) return _client;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL env var is missing (required at runtime).");
  }

  _client = new Redis(url);
  return _client;
}