import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isDemoHost } from "@/lib/demo";

const ALLOWED_FRAME_ANCESTORS = [
  "https://navis-docs.com",
  "https://www.navis-docs.com",
];

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const res = NextResponse.next();

  if (isDemoHost(host)) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.delete("X-Frame-Options");
    res.headers.set(
      "Content-Security-Policy",
      `frame-ancestors ${ALLOWED_FRAME_ANCESTORS.join(" ")};`,
    );
  } else {
    res.headers.set("X-Frame-Options", "DENY");
  }

  return res;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
