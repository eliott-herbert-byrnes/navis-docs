"use server";

import { z } from "zod";
import { limiter } from "../lib/rate-limit";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/crypto";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(5),
});

export const verifyOtpAction = async (input: { email: string; code: string }) => {
  const { success } = await limiter("otp:verify");
  if (!success) return { ok: false, message: "Too many attempts. Try later" };

  const parsed = schema.safeParse({
    email: input.email?.trim().toLowerCase(),
    code: input.code?.trim(),
  });
  if (!parsed.success) return { ok: false, message: "Invalid code" };

  const { email, code } = parsed.data;

  try {
    const res = await signIn("credentials", { email, code, redirect: false });
    if (res?.error) return { ok: false, message: res.error };
  } catch {
    return { ok: false, message: "Invalid code" };
  }

  await prisma.emailOTP.deleteMany({
    where: { email, codeHash: sha256(code) },
  });

  return { ok: true };
};