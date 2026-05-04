import type { Metadata } from "next";

import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";

const siteDescription =
  "Navis Docs helps teams capture, organize, and share operational knowledge.";

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Navis Docs",
    template: "%s | Navis Docs",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Navis Docs",
    title: "Navis Docs",
    description: siteDescription,
  },
  twitter: {
    title: "Navis Docs",
    description: siteDescription,
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground dark">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 pt-14" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
