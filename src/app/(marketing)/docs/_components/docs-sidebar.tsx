"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { DocArticle } from "../_content/docs";

type DocsSidebarProps = { articles: DocArticle[] };

function NavList({
  articles,
  onNavigate,
}: {
  articles: DocArticle[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 overflow-y-auto p-2">
      <div className="space-y-1">
        {articles.map((article) => {
          const href = `/docs/${article.slug}`;
          const active = pathname === href;
          return (
            <Link key={article.slug} href={href} onClick={onNavigate}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-sm font-normal",
                  active && "bg-accent",
                )}
              >
                <span className="truncate">{article.title}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DocsSidebar({ articles }: DocsSidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile: Sheet Drawer */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-7 left-6 z-50 rounded-full shadow-lg"
            >
              <Menu className="mr-2 h-4 w-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader className="border-b p-4">
              <SheetTitle>Documentation</SheetTitle>
            </SheetHeader>
            <NavList articles={articles} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      {/* Desktop: Regular Sidebar */}
      <aside className="col-span-6 mt-5 hidden flex-col bg-background sm:flex lg:col-span-4 pl-4">
        <NavList articles={articles} />
      </aside>
    </>
  );
}
