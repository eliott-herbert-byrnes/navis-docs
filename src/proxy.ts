import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isDemoHost } from "@/lib/demo";

const ALLOWED_FRAME_ANCESTORS = [
  "https://navisdocs.com",
  "https://www.navisdocs.com",
];

function applyDemoHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.delete("X-Frame-Options");
  res.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${ALLOWED_FRAME_ANCESTORS.join(" ")};`,
  );
}

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";

  if (isDemoHost(host) && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    const res = NextResponse.redirect(url);
    applyDemoHeaders(res);
    return res;
  }

  const res = NextResponse.next();

  if (isDemoHost(host)) {
    applyDemoHeaders(res);
  } else {
    res.headers.set("X-Frame-Options", "DENY");
  }

  return res;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
