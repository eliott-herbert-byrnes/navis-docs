import type { NextConfig } from "next";
import { validateDemoEnv } from "./src/lib/demo-env";

validateDemoEnv();

const nextConfig: NextConfig = {
  output: "standalone",
  // Static routes prerender aggressively; keep session/auth reads and cookies()/headers()
  // out of public (marketing) trees so they stay static. SessionProvider lives only under
  // (authenticated) for the same reason — it would otherwise opt pages into client session work.
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
