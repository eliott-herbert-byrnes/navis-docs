import type { Testimonial } from "./types";

export const testimonials = [
  {
    id: "alpha-placeholder",
    quote:
      "Placeholder quote — replace with a real customer story when testimonials are collected in PR 3.",
    author: "Jordan A.",
    role: "Operations lead, placeholder org",
  },
  {
    id: "beta-placeholder",
    quote:
      "Second placeholder quote to exercise layout; swap for social proof or remove until ready.",
    author: "Sam R.",
    role: "Engineering manager, placeholder org",
  },
] as const satisfies readonly Testimonial[];
