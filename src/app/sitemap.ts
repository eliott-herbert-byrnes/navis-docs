import type { MetadataRoute } from "next";

import { getMarketingSitemapPaths } from "./(marketing)/_content/nav";
import { getDocsSitemapPaths } from "./(marketing)/docs/_content/docs";

function metadataBase(): URL {
  return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = metadataBase();
  const lastModified = new Date();
  const allPaths = [
    ...new Set([...getMarketingSitemapPaths(), ...getDocsSitemapPaths()]),
  ];

  return allPaths.map((path) => ({
    url: new URL(path, base).toString(),
    lastModified,
  }));
}
