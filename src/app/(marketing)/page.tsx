import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/app/(marketing)/_content/faqs";
import { features } from "@/app/(marketing)/_content/features";
import { testimonials } from "@/app/(marketing)/_content/testimonials";
import { signInPath } from "@/app/paths";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Navis Docs helps teams capture, organize, and share operational knowledge from one place.",
  openGraph: {
    title: "Navis Docs",
    description:
      "Navis Docs helps teams capture, organize, and share operational knowledge from one place.",
  },
  twitter: {
    title: "Navis Docs",
    description:
      "Navis Docs helps teams capture, organize, and share operational knowledge from one place.",
  },
};

export default function MarketingHomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      <section aria-labelledby="hero-heading" className="space-y-4 text-center">
        <h1
          id="hero-heading"
          className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Run your ops docs from one place
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          TODO: Replace with real hero copy and primary CTA. This page is a shell
          for the marketing site bootstrap.
        </p>
      </section>

      <section aria-labelledby="features-heading" className="space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 id="features-heading" className="font-serif text-2xl font-semibold">
            Features
          </h2>
          <p className="text-muted-foreground">
            Highlights from typed content — see the full{" "}
            <Link
              href="/features"
              className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              features
            </Link>{" "}
            page.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature.id}
              className="rounded-lg border bg-card p-5 text-left shadow-sm"
            >
              <h3 className="font-serif text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="testimonials-heading" className="space-y-6">
        <h2 id="testimonials-heading" className="font-serif text-2xl font-semibold text-center sm:text-left">
          Testimonials
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {testimonials.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border bg-muted/30 p-6 text-left italic shadow-sm"
            >
              <blockquote className="space-y-4">
                <p className="text-foreground not-italic">&ldquo;{item.quote}&rdquo;</p>
                <footer className="text-sm not-italic text-muted-foreground">
                  <span className="font-medium text-foreground">{item.author}</span>
                  <span className="text-muted-foreground"> — {item.role}</span>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-heading" className="space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 id="faq-heading" className="font-serif text-2xl font-semibold">
            FAQ
          </h2>
          <p className="text-muted-foreground">
            Common questions — full list on{" "}
            <Link
              href="/faq"
              className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              FAQ
            </Link>
            .
          </p>
        </div>
        <dl className="space-y-6 text-left">
          {faqs.slice(0, 2).map((faq) => (
            <div key={faq.id} className="rounded-lg border bg-card p-5">
              <dt className="font-serif text-base font-semibold">{faq.question}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="get-started"
        className="rounded-lg border bg-muted/40 px-6 py-8 text-center"
      >
        <h2 id="get-started" className="font-serif text-xl font-semibold">
          Get started
        </h2>
        <p className="mt-2 text-muted-foreground">
          TODO: Wire primary CTA (demo / sign up). For now,{" "}
          <Link
            href={signInPath()}
            className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            sign in
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
