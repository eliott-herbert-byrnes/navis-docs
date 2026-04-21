import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Placeholder roadmap — may later redirect to GitHub Projects.",
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Roadmap</h1>
      <p className="text-muted-foreground">
        TODO: Embed or redirect to GitHub Projects. For now this route exists as a stub.
      </p>
    </div>
  );
}
