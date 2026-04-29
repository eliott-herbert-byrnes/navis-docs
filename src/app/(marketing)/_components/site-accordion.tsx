import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    value: "hosting",
    trigger: "How do I self host?",
    content:
      "Navis Docs is self-hostable on any infrastructure running Node.js 20+ and PostgreSQL 14+ with the pgvector extension. Clone the repository, set your environment variables, run the database migrations, and start the server. Full step-by-step instructions are in the README on GitHub. You'll need API keys for OpenAI and Anthropic if you want the AI search features.",
  },
  {
    value: "data",
    trigger: "Where is my data stored in the cloud version?",
    content:
      "All cloud data is stored in a PostgreSQL database hosted on Supabase in the EU region. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). You can export your organisation's data, and delete your organization along with its data at any time from the admin settings.",
  },
  {
    value: "integration",
    trigger: "How do I integrate my own API keys?",
    content:
      "Navis Docs uses OpenAI for semantic search and Anthropic Claude for the AI chat assistant. On the cloud version, these are managed from the admin settings. If you're self-hosting, add your OPENAI_API_KEY and ANTHROPIC_API_KEY to your .env file and the AI features will activate automatically.",
  },
  {
    value: "plans",
    trigger: "Is there a free plan?",
    content:
      "All cloud plans start with a 14-day free trial — no credit card required. If you need more time to evaluate, or you're a small team, the self-hosted version is free to run on your own infrastructure.",
  },
  {
    value: "funding",
    trigger: "How is the project funded?",
    content:
      "Navis Docs is open-source. For long-term sustainability, we offer a paid cloud version with features built for teams. Self-hosting the software is, and will always remain free. There's no obligation to use the cloud offering.",
  },
];

export function SiteAccordion() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full max-w-3xl rounded-lg bg-card text-card-foreground shadow-sm"
      defaultValue="hosting"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="border-b  px-5 py-2 first:pt-4 last:pb-4 last:border-b-0"
        >
          <AccordionTrigger className="font-serif text-lg font-normal sm:text-lg">
            {item.trigger}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
