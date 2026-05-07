import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { DocContent } from "../_components/doc-content";
import { docs } from "../_content/docs";

import { Content as AiFeaturesAndByok } from "../_content/ai-features-and-byok";
import { Content as AuditLogs } from "../_content/audit-logs";
import { Content as CreatingProcedures } from "../_content/creating-procedures";
import { Content as GettingStartedSelfHosting } from "../_content/getting-started-self-hosting";
import { Content as NewsPosts } from "../_content/news-posts";
import { Content as OnboardingToNavisDocs } from "../_content/onboarding-to-navis-docs";
import { Content as ProcedureRollouts } from "../_content/procedure-rollouts";
import { Separator } from "@/components/ui/separator";

const contentMap: Record<string, ComponentType> = {
  "ai-features-and-byok": AiFeaturesAndByok,
  "audit-logs": AuditLogs,
  "creating-procedures": CreatingProcedures,
  "getting-started-self-hosting": GettingStartedSelfHosting,
  "news-posts": NewsPosts,
  "onboarding-to-navis-docs": OnboardingToNavisDocs,
  "procedure-rollouts": ProcedureRollouts,
};

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = docs.find((d) => d.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: `${article.title} | Navis Docs`,
      description: article.description,
    },
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = docs.find((d) => d.slug === slug);
  const Content = contentMap[slug];
  if (!article || !Content) notFound();

  return (
    <div className="space-y-2">
      <h1 className="font-serif text-3xl">
        {article.title}
      </h1>
      <p className="text-muted-foreground mb-4">{article.description}</p>
      <Separator />
      <DocContent>
        <Content />
      </DocContent>
    </div>
  );
}
