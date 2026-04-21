import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "License",
  description: "Placeholder software license information for Navis Docs.",
};

export default function LicensePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">License</h1>
      <p className="text-muted-foreground">
        TODO: Link or inline the project license text when product licensing is finalized.
      </p>
    </div>
  );
}
