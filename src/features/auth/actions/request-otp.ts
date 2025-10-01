"use server";

import { z } from "zod";
import { createOtpFor } from "@/lib/otp";
import { Resend } from "resend";
import { limiter } from "../lib/rate-limit";

const schema = z.object({
  email: z.email().min(1, { message: "Is Required" }).max(191),
});
const resend = new Resend(process.env.RESEND_API_KEY);

export const requestOtpAction = async (emailRaw: string) => {
  const { success } = await limiter("otp:request");
  if (!success) return { ok: false, message: "Too many requests. Try later" };

  const parsedEmail = schema.safeParse({
    email: emailRaw.trim().toLowerCase(),
  });
  if (!parsedEmail.success) return { ok: false, message: "Invalid email" };
  const email = parsedEmail.data.email;

  const { code, expiresAt } = await createOtpFor(email);

  console.log(code, expiresAt);

  // TODO: purchase domain and add emails
  //   await resend.emails.send({
  //     from: "Navis Docs <no-reply@app.navisdocs.com>",
  //     to: email,
  //     subject: "Your sign-in code",
  //     text: `Your Navis Docs sign-in code is ${code}. It expires at ${expiresAt.toISOString()}.`,
  //   });

  return { ok: true, message: "Code sent. Check your email" };
};
