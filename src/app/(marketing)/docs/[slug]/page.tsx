import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { DocContent } from "../_components/doc-content";
import { docs } from "../_content/docs";

import { Content as GettingStartedSelfHosting } from "../_content/getting-started-self-hosting";
import { Separator } from "@/components/ui/separator";

const contentMap: Record<string, ComponentType> = {
  "getting-started-self-hosting": GettingStartedSelfHosting,
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
