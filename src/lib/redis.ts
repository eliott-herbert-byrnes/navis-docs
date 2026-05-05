import Redis from "ioredis";

let _client: Redis | null = null;

export function getRedis(): Redis {
  if (!_client) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is required");
    _client = new Redis(url);
  }
  return _client;
}
