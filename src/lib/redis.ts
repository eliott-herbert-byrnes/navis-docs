import Redis from "ioredis";

let _client: Redis | null = null;

function attachConnectionHandlers(client: Redis): void {
  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });

  client.on("reconnecting", (delayMs: number) => {
    console.warn(`[redis] reconnecting in ${delayMs}ms`);
  });

  client.on("ready", () => {
    console.info("[redis] connection ready");
  });

  client.on("close", () => {
    console.warn("[redis] connection closed");
  });
}

export function getRedis(): Redis {
  if (_client) return _client;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL env var is missing (required at runtime).");
  }

  _client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 20) return null;
      return Math.min(times * 200, 2000);
    },
    reconnectOnError(err) {
      return /READONLY|ECONNRESET|ETIMEDOUT|ECONNREFUSED/i.test(err.message);
    },
  });

  attachConnectionHandlers(_client);
  return _client;
}

/** True when the singleton client exists and ioredis reports a live connection. */
export function isRedisReady(): boolean {
  return _client?.status === "ready";
}
