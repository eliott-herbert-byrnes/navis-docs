import type { CompanyLogo } from "./types";

export const companyLogos = [
  {
    id: "airbus",
    src: "/logos/airbus-svg.svg",
    alt: "Airbus",
  },
  {
    id: "bitwarden",
    src: "/logos/bitwarden-svg.svg",
    alt: "Bitwarden",
  },
  {
    id: "couchbase",
    src: "/logos/couchbase-svg.svg",
    alt: "Couchbase",
  },
  {
    id: "exness",
    src: "/logos/exness.svg",
    alt: "Exness",
  },
  {
    id: "anedot",
    src: "/logos/anedot.svg",
    alt: "Anedot",
  },
] as const satisfies readonly CompanyLogo[];
