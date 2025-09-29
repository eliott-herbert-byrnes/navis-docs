import { NextResponse } from "next/server";
import { createOtpFor } from "@/lib/otp";
import { limiter } from "@/lib/ratelimit";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const { success } = await limiter.limit(`otp:${ip}`);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { code, expiresAt } = await createOtpFor(email);

  await resend.emails.send({
    from: "Navis Docs <no-reply@app.navisdocs.com>",
    to: email,
    subject: "Your sign-in code",
    text: `Your Navis Docs sign-in code is ${code}. It expires at ${expiresAt.toISOString()}.`,
  });

  return NextResponse.json({ ok: true });
}