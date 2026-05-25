export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Navis Docs <no-reply@app.navisdocs.com>";
}

/** Root URL for email CTAs; "/" when NEXT_PUBLIC_APP_URL is unset (same pattern as legacy billing links). */
export function getAppHomeUrlForEmail(): string {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/` : "/";
}

/** Subscription page URL for billing-related email CTAs. */
export function getSubscriptionUrlForEmail(): string {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/subscription` : "/subscription";
}
