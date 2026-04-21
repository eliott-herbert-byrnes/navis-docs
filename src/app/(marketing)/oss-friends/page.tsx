import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OSS friends",
  description: "Placeholder page highlighting open-source friends and dependencies.",
};

export default function OssFriendsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">OSS friends</h1>
      <p className="text-muted-foreground">
        TODO: List projects we admire or build on — logos and short blurbs.
      </p>
    </div>
  );
}
