import type { Faq } from "./types";

export const faqs = [
  {
    id: "what-is",
    question: "What is Navis Docs?",
    answer:
      "Placeholder — describe the product in one or two sentences for visitors who land from search or referrals.",
  },
  {
    id: "who-for",
    question: "Who is it for?",
    answer:
      "Placeholder — teams running repeatable operational work: clinics, logistics, hospitality, internal tooling, and similar.",
  },
  {
    id: "pricing",
    question: "How does pricing work?",
    answer:
      "Placeholder — point readers to /pricing and note that plans connect to checkout after sign-in (see pricing page CTAs).",
  },
  {
    id: "security",
    question: "Where does my data live?",
    answer:
      "Placeholder — summarize hosting region, encryption, and retention at a high level once legal approves wording.",
  },
] as const satisfies readonly Faq[];
