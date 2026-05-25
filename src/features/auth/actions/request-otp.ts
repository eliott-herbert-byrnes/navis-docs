"use server";

import React from "react";
import { z } from "zod";
import { getEmailFrom } from "@/lib/email";
import { createOtpFor } from "@/lib/otp";
import { getResend } from "@/lib/resend";
import { render } from "@react-email/render";
import { headers } from "next/headers";
import { limiter } from "../lib/rate-limit";
import { SignInOtpEmail } from "@/emails/sign-in-otp";

const schema = z.object({
  email: z.email().min(1, { message: "Is Required" }).max(191),
});

export const requestOtpAction = async (emailRaw: string) => {
  const ip = (await headers()).get("x-forwarded-for") ?? "anon";
  const { success } = await limiter(`otp:request:${ip}`);
  if (!success)
    return { ok: false, message: "Too many requests, try again later" };

  const parsedEmail = schema.safeParse({
    email: emailRaw.trim().toLowerCase(),
  });
  if (!parsedEmail.success)
    return {
      ok: false,
      message: "Invalid email, check the address and try again",
    };
  const email = parsedEmail.data.email;

  const { code } = await createOtpFor(email);

  try {
    const resend = getResend();
    const html = await render(React.createElement(SignInOtpEmail, { code }));
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: "Your sign-in code",
      html,
    });
    if (error) {
      console.error("[requestOtp] failed to send email", error);
      return {
        ok: false,
        message: "Could not send sign-in code, try again later",
      };
    }
  } catch (err) {
    console.error("[requestOtp] failed to send email", err);
    return {
      ok: false,
      message: "Could not send sign-in code, try again later",
    };
  }

  return { ok: true, message: "Code sent. Check your email" };
};
