import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { docs } from "./_content/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guides and references for Navis Docs.",
};

export default function DocsIndexPage() {
  return (
    <div className="space-y-8 w-[100%]">
      <ul className="space-y-2">
        {docs.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/docs/${article.slug}`}
              className={cn(
                "group block rounded-sm outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Card
                className={cn(
                  "border py-4 transition-colors",
                  "hover:border-primary/40 hover:bg-accent/30",
                  "group-focus-visible:border-primary/40",
                )}
              >
                <CardHeader className="relative flex flex-row items-start gap-4 space-y-0">
                  <div className="min-w-0 flex-1 space-y-2">
                    <h2 className="text-lg font-semibold leading-none transition-colors group-hover:text-primary">
                      {article.title}
                    </h2>
                    <CardDescription className="line-clamp-0">
                      {article.description}
                    </CardDescription>
                  </div>
                  <CardAction className="text-muted-foreground group-hover:text-foreground">
                    <ExternalLink className="size-5" aria-hidden />
                  </CardAction>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
