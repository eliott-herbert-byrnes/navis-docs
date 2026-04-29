import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default function MarketingNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-6 py-16 text-center">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <p>
        <Link
          href="/"
          className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to home
        </Link>
      </p>
    </div>
  );
}
