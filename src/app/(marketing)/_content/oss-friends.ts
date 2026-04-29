export type OssFriend = {
  /** Display name (used for sorting). */
  name: string;
  /** Full URL including https:// */
  href: string;
  /** Plain text; use `<` and `&` as normal characters in TypeScript strings. */
  description: string;
};

const OSS_FRIENDS_UNSORTED: readonly OssFriend[] = [
  {
    name: "Activepieces",
    href: "https://activepieces.com",
    description:
      "Activepieces is an open source, no-code, AI-first business automation tool. Alternative to Zapier, Make and Workato.",
  },
  {
    name: "Appsmith",
    href: "https://www.appsmith.com",
    description: "Build custom software on top of your data.",
  },
  {
    name: "Aptabase",
    href: "https://aptabase.com",
    description:
      "Analytics for Apps, open source, simple and privacy-friendly. SDKs for Swift, React Native, Electron, Flutter and many others.",
  },
  {
    name: "Argos",
    href: "https://argos-ci.com",
    description:
      "Argos provides the developer tools to debug tests and detect visual regressions.",
  },
  {
    name: "Bifrost",
    href: "https://www.getmaxim.ai/bifrost",
    description:
      "Fastest LLM gateway with adaptive load balancer, cluster mode, guardrails, 1000+ models support & <100 µs overhead at 5k RPS.",
  },
  {
    name: "Cal.com",
    href: "https://cal.com",
    description:
      "Cal.com is a scheduling tool that helps you schedule meetings without the back-and-forth emails.",
  },
  {
    name: "Cap",
    href: "https://cap.so",
    description:
      "Cap is the open source alternative to Loom. Lightweight, powerful, and cross-platform. Record and share securely in seconds.",
  },
  {
    name: "ClassroomIO.com",
    href: "https://www.classroomio.com",
    description:
      "ClassroomIO is a no-code tool that allows you build and scale your own teaching platform with ease.",
  },
  {
    name: "Documenso",
    href: "https://documenso.com",
    description:
      "The Open-Source DocuSign Alternative. We aim to earn your trust by enabling you to self-host the platform and examine its inner workings.",
  },
  {
    name: "Formbricks",
    href: "https://formbricks.com",
    description:
      "Open source survey software and Experience Management Platform. Understand your customers, keep full control over your data.",
  },
  {
    name: "Ghostfolio",
    href: "https://ghostfol.io",
    description:
      "Ghostfolio is a privacy-first, open source dashboard for your personal finances. Designed to simplify asset tracking and empower informed investment decisions.",
  },
  {
    name: "Hanko",
    href: "https://www.hanko.io",
    description:
      "Open-source authentication and user management for the passkey era. Integrated in minutes, for web and mobile apps.",
  },
  {
    name: "Hook0",
    href: "https://www.hook0.com/",
    description:
      "Open-Source Webhooks-as-a-service (WaaS) that makes it easy for developers to send webhooks.",
  },
  {
    name: "Inbox Zero",
    href: "https://getinboxzero.com",
    description:
      "Inbox Zero makes it easy to clean up your inbox and reach inbox zero fast. It provides bulk newsletter unsubscribe, cold email blocking, email analytics, and AI automations.",
  },
  {
    name: "KeepHQ",
    href: "https://www.keephq.dev",
    description: "Keep is an open-source AIOps (AI for IT operations) platform",
  },
  {
    name: "Langfuse",
    href: "https://langfuse.com",
    description:
      "Open source LLM engineering platform. Debug, analyze and iterate together.",
  },
  {
    name: "Mockoon",
    href: "https://mockoon.com",
    description:
      "Mockoon is the easiest and quickest way to design and run mock REST APIs.",
  },
  {
    name: "Novu",
    href: "https://novu.co",
    description:
      "The open-source notification infrastructure for developers. Simple components and APIs for managing all communication channels in one place.",
  },
  {
    name: "OpenBB",
    href: "https://openbb.co",
    description:
      "Democratizing investment research through an open source financial ecosystem. The OpenBB Terminal allows everyone to perform investment research, from everywhere.",
  },
  {
    name: "Onyx",
    href: "https://onyx.app",
    description:
      "Onyx is the open-source AI chat connected to your docs, apps, and people.",
  },
  {
    name: "OpenStatus",
    href: "https://www.openstatus.dev",
    description: "Open-source monitoring platform with beautiful status pages",
  },
  {
    name: "Papermark",
    href: "https://www.papermark.com/",
    description:
      "Open-Source Docsend Alternative to securely share documents with real-time analytics.",
  },
  {
    name: "Portkey AI",
    href: "https://www.portkey.ai/",
    description:
      "AI Gateway with integrated Guardrails. Route to 250+ LLMs and 50+ Guardrails with 1-fast API. Supports caching, retries, and edge deployment for low latency.",
  },
  {
    name: "Prisma",
    href: "https://www.prisma.io",
    description:
      "Simplify working with databases. Build, optimize, and grow your app easily with an intuitive data model, type-safety, automated migrations, connection pooling, caching, and real-time db subscriptions.",
  },
  {
    name: "Requestly",
    href: "https://requestly.com",
    description:
      "Makes frontend development cycle 10x faster with API Client, Mock Server, Intercept & Modify HTTP Requests and Session Replays.",
  },
  {
    name: "Rivet",
    href: "https://rivet.gg",
    description:
      "Open-source solution to deploy, scale, and operate your multiplayer game.",
  },
  {
    name: "Rybbit",
    href: "https://rybbit.com",
    description:
      "Next-gen, open source, lightweight, cookieless web & product analytics for everyone.",
  },
  {
    name: "Shelf.nu",
    href: "https://www.shelf.nu/",
    description:
      "Open Source Asset and Equipment tracking software that lets you create QR asset labels, manage and overview your assets across locations.",
  },
  {
    name: "Sniffnet",
    href: "https://www.sniffnet.net",
    description:
      "Sniffnet is a network monitoring tool to help you easily keep track of your Internet traffic.",
  },
  {
    name: "Tiledesk",
    href: "https://tiledesk.com",
    description:
      "The innovative open-source framework for developing LLM-enabled chatbots, Tiledesk empowers developers to create advanced, conversational AI agents.",
  },
  {
    name: "Tolgee",
    href: "https://tolgee.io",
    description: "Software localization from A to Z made really easy.",
  },
  {
    name: "Trigger.dev",
    href: "https://trigger.dev",
    description:
      "Create long-running Jobs directly in your codebase with features like API integrations, webhooks, scheduling and delays.",
  },
  {
    name: "Typebot",
    href: "https://typebot.io",
    description:
      "Typebot gives you powerful blocks to create unique chat experiences. Embed them anywhere on your apps and start collecting results like magic.",
  },
  {
    name: "Twenty",
    href: "https://twenty.com",
    description:
      "A modern CRM offering the flexibility of open-source, advanced features and sleek design.",
  },
  {
    name: "Unkey",
    href: "https://unkey.dev",
    description:
      "An API authentication and authorization platform for scaling user facing APIs. Create, verify, and manage low latency API keys in seconds.",
  },
  {
    name: "Voltagent",
    href: "https://voltagent.dev/",
    description:
      "Open Source TypeScript framework for building AI agents with enterprise-grade capabilities and seamless integrations.",
  },
  {
    name: "Webiny",
    href: "https://www.webiny.com",
    description:
      "Open-source enterprise-grade serverless CMS. Own your data. Scale effortlessly. Customize everything.",
  },
  {
    name: "Webstudio",
    href: "https://webstudio.is",
    description: "Webstudio is an open source alternative to Webflow",
  },
];

/** Alphabetical by display name; stable for rendering and maintenance. */
export const OSS_FRIENDS: readonly OssFriend[] = [...OSS_FRIENDS_UNSORTED].sort(
  (a, b) => a.name.localeCompare(b.name),
);

export function faviconUrlForHref(href: string): string {
  const host = new URL(href).hostname;
  const params = new URLSearchParams({ domain: host, sz: "128" });
  return `https://www.google.com/s2/favicons?${params.toString()}`;
}
