import { NextResponse } from "next/server";
import { auth } from "./auth";
import { signInPath } from "./app/paths";

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const signInUrl = new URL(signInPath(), req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const response = NextResponse.next();

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
  `;

  response.headers.set("Content-Security-Policy", cspHeader.replace(/\s+/g, " ").trim());
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  return response;
});

export const config = {
  matcher: ["/((?!_next|api|auth|favicon.ico|.*\\..*).*)"],
};