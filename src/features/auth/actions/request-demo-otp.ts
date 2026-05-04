"use server";

import { createOtpFor } from "@/lib/otp";

const DEMO_EMAIL = "demo@navisdocs.com";

export const requestDemoOtpAction = async () => {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return {
      ok: false,
      message: "Demo mode is not enabled, use the sign-in page in production",
    };
  }

  try {
    const otp = await createOtpFor(DEMO_EMAIL);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEMO] Demo account OTP: ${otp.code} (expires at ${otp.expiresAt.toISOString()})`,
      );
    }

    return { ok: true, message: "Demo code generated", code: otp.code };
  } catch (error) {
    console.error("Failed to generate demo code:", error);
    return {
      ok: false,
      message: "Failed to generate demo code, try again or refresh the page",
    };
  }
};
