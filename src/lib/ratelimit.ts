
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "./redis";

let _ratelimit: Ratelimit | null = null;

export function getRatelimit() {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "rtlmt",
    });
  }
  return _ratelimit;
}
export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const {success} = await getRatelimit().limit(ip);

    if(!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
}