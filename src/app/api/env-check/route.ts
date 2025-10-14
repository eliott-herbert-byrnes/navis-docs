// src/app/api/env-check/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    stripeKeyPresent: !!process.env.STRIPE_SECRET_KEY,
    runtime: process.release?.name, // "node"
    node: process.version,
  });
}