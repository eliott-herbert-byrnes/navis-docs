import Image from "next/image";
import Link from "next/link";

import { primaryNav } from "@/app/(marketing)/_content/nav";
import { dashboardPath } from "@/app/paths";
import { Button } from "@/components/ui/button";

import { MobileNav } from "./mobile-nav";

const navLinkClass =
  "rounded-sm px-2 py-1.5 text-sm font-medium text-foreground outline-offset-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function SiteHeader() {
  return (
    <header className="border-border fixed inset-x-0 top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-sm text-foreground outline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image src="/navis-docs-logo-svg.svg" width={30} height={30} alt="" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-2 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass}
              {...("target" in item && item.target
                ? {
                    target: item.target,
                    rel: "noopener noreferrer",
                  }
                : {})}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          <Button
            asChild
            size={"default"}
            variant="outline"
            className="hidden shrink-0 md:inline-flex"
          >
            <Link href={dashboardPath()}>App</Link>
          </Button>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
