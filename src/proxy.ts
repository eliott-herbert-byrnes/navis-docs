import { NextResponse } from "next/server";
import { auth } from "./auth";
import { signInPath } from "./app/paths";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/departments",
  "/settings",
  "/subscription",
  "/procedure-base",
  "/user-base",
  "/ideas",
  "/errors",
  "/audit",
  "/invite",
  "/categories",
  "/onboarding",
] as const;

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.sentry-cdn.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.github.com https://*.sentry.io https://api.anthropic.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `
  .replace(/\s+/g, " ")
  .trim();

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const signInUrl = new URL(signInPath(), req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // CSP for protected responses only — other security headers are in next.config.ts
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
