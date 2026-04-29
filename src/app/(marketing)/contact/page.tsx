import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Placeholder contact page for Navis Docs.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="text-muted-foreground">
        TODO: Add contact form or mailto — engineering placeholder only.
      </p>
    </div>
  );
}
