import Link from "next/link";

import { footerNav } from "@/app/(marketing)/_content/nav";

const footerLinkClass =
  "rounded-sm text-muted-foreground outline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function SiteFooter() {
  return (
    <footer className="border-border border-t py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Footer">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerNav.map((column) => (
              <div key={column.title} className="space-y-3">
                <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                  {column.title}
                </h2>
                <ul className="space-y-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={footerLinkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
        <p className="mt-10 text-sm text-muted-foreground">
          © Navis Docs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
