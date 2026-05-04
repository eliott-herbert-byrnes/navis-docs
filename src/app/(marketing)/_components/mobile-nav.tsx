"use client";

import * as React from "react";
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

const mobileNavLinkClass =
  "flex w-full items-center rounded-md px-3 py-2.5 text-base font-medium text-foreground outline-offset-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function MobileNav() {
  const pathname = usePathname();
  const isDocsRoute = pathname.startsWith("/docs");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (isDocsRoute) return null;

  return (
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
  );
}
