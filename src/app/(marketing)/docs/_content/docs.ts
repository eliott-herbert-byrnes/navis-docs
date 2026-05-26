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
  {
    slug: "onboarding-to-navis-docs",
    title: "Onboarding to Navis Docs",
    description:
      "How to sign in, set up your organization, invite users, and understand roles.",
  },
  {
    slug: "creating-procedures",
    title: "Creating Procedures",
    description:
      "How procedure formats, drafts, publishing, versions, categories, and ideas work.",
  },
  {
    slug: "procedure-rollouts",
    title: "Procedure Rollouts",
    description:
      "How procedure rollout notifications, acknowledgments, compliance, and admin tracking work.",
  },
  {
    slug: "news-posts",
    title: "News Posts",
    description:
      "How team announcements, pinned posts, read receipts, and procedure publish news work.",
  },
  {
    slug: "ai-features-and-byok",
    title: "AI Features and BYOK",
    description:
      "How self-hosted AI features work, which provider keys are needed, and how BYOK is managed.",
  },
  {
    slug: "audit-logs",
    title: "Audit Logs",
    description:
      "How admins review, filter, and export audit history for compliance and operational oversight.",
  },
];

export function getDocsSitemapPaths(): string[] {
  return ["/docs", ...docs.map((d) => `/docs/${d.slug}`)];
}
