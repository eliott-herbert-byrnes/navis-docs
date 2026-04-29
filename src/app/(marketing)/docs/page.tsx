import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Documentation is coming soon.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Documentation</h1>
      <p className="text-muted-foreground">Coming soon — public docs tooling is planned for a later PR.</p>
    </div>
  );
}
