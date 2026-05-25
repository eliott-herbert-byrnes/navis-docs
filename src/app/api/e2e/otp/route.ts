import { getRedis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (process.env.E2E_TEST_MODE !== "true") {
    return new NextResponse(null, { status: 404 });
  }

  const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const code = await getRedis().get(`e2e:otp:${email}`);
    if (!code) {
      return NextResponse.json({ error: "no otp for email" }, { status: 404 });
    }
    return NextResponse.json({ code });
  } catch (err) {
    console.error("[e2e/otp] redis unavailable", err);
    return NextResponse.json({ error: "otp store unavailable" }, { status: 503 });
  }
}
