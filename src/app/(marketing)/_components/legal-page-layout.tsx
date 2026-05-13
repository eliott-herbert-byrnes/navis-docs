interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Shared wrapper for Terms, Privacy, and License pages.
 *
 * - Constrains width to max-w-3xl with consistent responsive padding.
 * - Renders the page h1 in the project serif font.
 * - Applies Tailwind Typography (prose) to all child content, so plain
 *   h2/p/ul/a elements are styled without extra utility classes on each.
 * - dark:prose-invert keeps text readable in dark mode.
 */
export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}
