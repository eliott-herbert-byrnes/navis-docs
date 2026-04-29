import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { OssFriend } from "@/app/(marketing)/_content/oss-friends";
import { faviconUrlForHref } from "@/app/(marketing)/_content/oss-friends";
import { cn } from "@/lib/utils";

export function OssFriendCard({ friend }: { friend: OssFriend }) {
  const faviconSrc = faviconUrlForHref(friend.href);

  return (
    <Link
      href={friend.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block rounded-sm outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <Card
        className={cn(
          "h-30 border py-4 transition-colors",
          "hover:border-primary/40 hover:bg-accent/30",
          "group-focus-visible:border-primary/40",
        )}
      >
        <CardHeader className="relative flex flex-row items-start gap-4 space-y-0">
          <Image
            src={faviconSrc}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-sm"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-lg font-semibold leading-none transition-colors group-hover:text-primary">
              {friend.name}
            </h2>
            <CardDescription className="line-clamp-3">
              {friend.description}
            </CardDescription>
          </div>
          <CardAction className="text-muted-foreground group-hover:text-foreground">
            <ExternalLink className="size-5" aria-hidden />
          </CardAction>
          <span className="sr-only">Opens in a new tab</span>
        </CardHeader>
      </Card>
    </Link>
  );
}
