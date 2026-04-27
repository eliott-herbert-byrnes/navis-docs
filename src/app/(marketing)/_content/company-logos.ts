import type { CompanyLogo } from "./types";

export const companyLogos = [
  {
    id: "airbus",
    src: "/logos/airbus.png",
    width: 150,
    height: 150,
    alt: "Airbus",
  },
  {
    id: "bitwarden",
    src: "/logos/bitwarden.png",
    width: 150,
    height: 150,
    alt: "Bitwarden",
  },
  {
    id: "couchbase",
    src: "/logos/couchbase.png",
    width: 150,
    height: 150,
    alt: "Couchbase",
  },
  {
    id: "deloitte",
    src: "/logos/deloitte.png",
    width: 150,
    height: 150,
    alt: "Deloitte",
  },
  {
    id: "sana",
    src: "/logos/sana.png",
    width: 150,
    height: 150,
    alt: "Sana",
  },
  {
    id: "wakam",
    src: "/logos/wakam.png",
    width: 150,
    height: 150,
    alt: "Wakam",
  },
] as const satisfies readonly CompanyLogo[];
