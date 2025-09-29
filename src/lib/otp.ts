import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export const createOtpFor = async (email: string) => {
  const code = ("" + Math.floor(10000 + Math.random() * 90000)).slice(0, 5);
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  await prisma.emailOTP.create({
    data: { email: email.toLowerCase(), codeHash, expiresAt },
  });

  return { code, expiresAt };
};

export const verifyOtpAndConsume = async (email: string, code: string) => {
  const row = await prisma.emailOTP.findFirst({
    where: {
      email: email.toLowerCase(),
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return false;
  if (row.attempts >= 5) return false;
  const ok = row.codeHash === hashCode(code);
  await prisma.emailOTP.update({
    where: { id: row.id },
    data: {
      attempts: row.attempts + 1,
      consumedAt: ok ? new Date() : null,
    },
  });
  return ok;
};
