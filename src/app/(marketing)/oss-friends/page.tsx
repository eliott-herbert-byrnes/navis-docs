import type { Metadata } from "next";

import { OSS_FRIENDS } from "@/app/(marketing)/_content/oss-friends";
import { OssFriendCard } from "@/app/(marketing)/_components/oss-friend-card";

const description =
  "Open-source projects we admire and recommend — built by teams across the community.";

export const metadata: Metadata = {
  title: "OSS friends",
  description,
  openGraph: {
    title: "OSS friends | Navis Docs",
    description,
  },
  twitter: {
    title: "OSS friends | Navis Docs",
    description,
  },
};

export default function OssFriendsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl">OSS friends</h1>
        <p className="text-muted-foreground">
          We&apos;re proud to be part of the open source community. Here are some
          amazing open source projects we love and support.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {OSS_FRIENDS.map((friend) => (
          <li key={friend.href}>
            <OssFriendCard friend={friend} />
          </li>
        ))}
      </ul>
    </div>
  );
}
