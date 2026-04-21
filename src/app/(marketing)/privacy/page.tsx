import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Placeholder privacy policy — legal copy to be supplied later.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Privacy policy
      </h1>
      <p className="text-muted-foreground">
        TODO: Replace with final privacy policy and data handling details.
      </p>
    </div>
  );
}
