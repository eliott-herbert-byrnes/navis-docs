import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10s"),
    analytics: true,
    prefix: "rtlmt",
});
