export type DocArticle = {
  slug: string;
  title: string;
  description: string;
};

export const docs: DocArticle[] = [
  {
    slug: "getting-started-self-hosting",
    title: "Getting Started with Self Hosting",
    description: "How to run Navis Docs on your own infrastructure.",
  },
  // add more articles here for launch
];

export function getDocsSitemapPaths(): string[] {
  return ["/docs", ...docs.map((d) => `/docs/${d.slug}`)];
}
