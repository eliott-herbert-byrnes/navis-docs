import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Placeholder terms of service — legal copy to be supplied later.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Terms of service
      </h1>
      <p className="text-muted-foreground">
        TODO: Replace with final terms. This is not legal advice or a binding document.
      </p>
    </div>
  );
}
