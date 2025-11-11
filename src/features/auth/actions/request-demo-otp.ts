"use server";

import { createOtpFor } from "@/lib/otp";

const DEMO_EMAIL = "demo@navisdocs.com";

export const requestDemoOtpAction = async () => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return { ok: false, message: "Demo mode is not enabled" };
  }

  try {
    const { code, expiresAt } = await createOtpFor(DEMO_EMAIL);

    console.log(
      `[DEMO] Demo account OTP: ${code} (expires at ${expiresAt.toISOString()})`
    );

    return { ok: true, message: "Demo code generated", code };
  } catch (error) {
    return { ok: false, message: "Failed to generate demo code" };
  }
};
