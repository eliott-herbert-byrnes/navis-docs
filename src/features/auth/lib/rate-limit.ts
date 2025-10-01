'use server';

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = Redis.fromEnv();
const base = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10s"),
    analytics: true,
    prefix: `rl:${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}:auth`,
});

export async function limiter(scope: string) {
    const h = await headers();
    const ip = (h.get('x-forwarded-for') ?? 'unknown').split(',')[0]!.trim();
    return base.limit(`${scope}:${ip}`);
}