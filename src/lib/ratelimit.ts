import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "rtlmt",
});

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const {success} = await ratelimit.limit(ip);

    if(!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
}