import type { MetadataRoute } from "next";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Authenticated app shells and auth flows — not for public indexing. */
const DISALLOW_PATHS = [
  "/api/",
  "/auth/",
  "/dashboard",
  "/departments",
  "/settings",
  "/onboarding",
  "/subscription",
  "/audit",
  "/procedure-base",
  "/invite",
  "/user-base",
  "/categories",
  "/errors",
  "/ideas",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOW_PATHS],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
