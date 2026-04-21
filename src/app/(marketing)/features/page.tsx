import type { Metadata } from "next";

import { features } from "@/app/(marketing)/_content/features";

export const metadata: Metadata = {
  title: "Features",
  description:
    "How Navis Docs helps teams keep procedures, access, and change history in one operational workspace.",
  openGraph: {
    title: "Features | Navis Docs",
    description:
      "How Navis Docs helps teams keep procedures, access, and change history in one operational workspace.",
  },
  twitter: {
    title: "Features | Navis Docs",
    description:
      "How Navis Docs helps teams keep procedures, access, and change history in one operational workspace.",
  },
};

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-2">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Features</h1>
        <p className="text-muted-foreground">
          Structured overview sourced from typed content modules — copy and icons can
          evolve in PR 3 without changing routes or layout.
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <li
            key={feature.id}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <h2 className="font-serif text-xl font-semibold">{feature.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
