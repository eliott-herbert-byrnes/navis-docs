import type { FooterColumn, NavLink } from "./types";

/** Header: Features, Docs, Roadmap, Pricing (plan §2.3). */
export const primaryNav = [
  { href: "/features", label: "Features" },
  { href: "/docs", label: "Docs" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/pricing", label: "Pricing" },
] as const satisfies readonly NavLink[];

/** Footer columns (plan §2.3). Single source for footer + sitemap discovery. */
export const footerNav = [
  {
    title: "Documentation",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/features", label: "Features" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/oss-friends", label: "OSS friends" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/license", label: "License" },
    ],
  },
] as const satisfies readonly FooterColumn[];

/**
 * All public marketing paths for `sitemap.ts` — derived from nav definitions so
 * new footer/header links stay in sync with the sitemap.
 */
export function getMarketingSitemapPaths(): string[] {
  const paths = new Set<string>(["/"]);
  for (const item of primaryNav) paths.add(item.href);
  for (const column of footerNav) {
    for (const link of column.links) paths.add(link.href);
  }
  return Array.from(paths).sort((a, b) => a.localeCompare(b));
}
