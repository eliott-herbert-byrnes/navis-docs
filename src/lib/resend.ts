import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend() {
  const key = process.env.RESEND_API_KEY;

  // Important: do NOT throw at import/build time.
  // Throw only when the code path is actually used at runtime.
  if (!key) {
    throw new Error("RESEND_API_KEY is missing (required at runtime).");
  }

  if (!_resend) _resend = new Resend(key);
  return _resend;
}
