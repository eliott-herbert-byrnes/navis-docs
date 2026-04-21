import type { Metadata } from "next";

import { faqs } from "@/app/(marketing)/_content/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Navis Docs, pricing, and how operational content is organized.",
  openGraph: {
    title: "FAQ | Navis Docs",
    description:
      "Answers to common questions about Navis Docs, pricing, and how operational content is organized.",
  },
  twitter: {
    title: "FAQ | Navis Docs",
    description:
      "Answers to common questions about Navis Docs, pricing, and how operational content is organized.",
  },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">FAQ</h1>
        <p className="text-muted-foreground">
          Typed FAQ content — an accordion UI can replace this list in a follow-up without
          changing the underlying data shape.
        </p>
      </div>
      <dl className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-lg border bg-card p-6 shadow-sm">
            <dt className="font-serif text-lg font-semibold">{faq.question}</dt>
            <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
