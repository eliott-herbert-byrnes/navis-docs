export type CompanyLogo = {
  id: string;
  src: string;
  width: number;
  height: number;
  /** Accessible label, e.g. company name */
  alt: string;
};

export type Feature = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export type HeroFeatures = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

/** Stripe / app subscription query param: `/subscription?plan=<slug>` */
export type PricingPlan = {
  id: string;
  name: string;
  planSlug: string;
  blurb: string;
};

export type NavLink = {
  href: string;
  label: string;
};

export type FooterColumn = {
  title: string;
  links: readonly NavLink[];
};
