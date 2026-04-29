"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { primaryNav } from "@/app/(marketing)/_content/nav";
import { dashboardPath } from "@/app/paths";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const navLinkClass =
  "rounded-sm px-2 py-1.5 text-sm font-medium text-foreground outline-offset-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const mobileNavLinkClass =
  "flex w-full items-center rounded-md px-3 py-2.5 text-base font-medium text-foreground outline-offset-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function SiteHeader() {
  const pathname = usePathname();
  const isDocsRoute = pathname.startsWith("/docs");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="border-border fixed inset-x-0 top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-sm text-foreground outline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src="/navis-docs-logo-svg.svg"
            width={30}
            height={30}
            alt=""
            priority
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-2 md:flex"
        >
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass} {...("target" in item && item.target
              ? {
                target: item.target,
                rel: "noopener noreferrer",
              }
              : {})}>
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

          {!isDocsRoute && (
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                >
                  <MenuIcon className="size-5" aria-hidden />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="top-4 right-4 left-auto max-h-[min(100dvh-2rem,32rem)] w-[min(100%-2rem,20rem)] translate-x-0 translate-y-0 overflow-y-auto sm:max-w-sm dark">
                <DialogHeader>
                  <DialogTitle className="text-left">Site navigation</DialogTitle>
                  <DialogDescription className="sr-only text-left">
                    Main pages and a shortcut to the application dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1 pt-2">
                  <DialogClose asChild>
                    <Link
                      href={dashboardPath()}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "justify-center text-white",
                      )}
                    >
                      Go to app
                    </Link>
                  </DialogClose>
                  {primaryNav.map((item) => (
                    <DialogClose key={item.href} asChild>
                      <Link href={item.href} className={mobileNavLinkClass}>
                        {item.label}
                      </Link>
                    </DialogClose>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
