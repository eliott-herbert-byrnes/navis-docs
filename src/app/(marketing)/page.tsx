import type { Metadata } from "next";
import Link from "next/link";
import { companyLogos } from "@/app/(marketing)/_content/company-logos";
import { features } from "@/app/(marketing)/_content/features";
import { HeroFeature } from "@/app/(marketing)/_content/hero-features";
import { dashboardPath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SiteAccordion } from "./_components/site-accordion";

/** Shared alt text for repeated marketing screenshots (a11y + SEO). */
const marketingAlt = {
  heroProductUi:
    "Screenshot of Navis Docs showing the main application workspace and navigation.",
  heroBackdrop:
    "Wide decorative background graphic behind the product preview area.",
  orgStructureUi:
    "Screenshot of Navis Docs illustrating departments and teams within an organization.",
  orgFeatureBackdrop:
    "Wide decorative background graphic behind the organization structure preview.",
} as const;

export const metadata: Metadata = {
  title: "Home",
  description:
    "Navis Docs helps teams capture, organize, and share operational knowledge from one place.",
  openGraph: {
    title: "Navis Docs",
    description:
      "Navis Docs helps teams capture, organize, and share operational knowledge from one place.",
  },
  twitter: {
    title: "Navis Docs",
    description:
      "Navis Docs helps teams capture, organize, and share operational knowledge from one place.",
  },
};

export default function MarketingHomePage() {

  return (
    <div className="mx-auto space-y-16 px-4 py-12 sm:px-6 lg:px-8">

      <section
        aria-labelledby="hero-heading"
        className="space-y-4 lg:max-w-[50%]"
      >
        <h1
          id="hero-heading"
          className="font-serif text-4xl sm:text-5xl leading-14"
        >
          The open source platform for knowledge and SOP management
        </h1>
        <p className="text-muted-foreground text-xl sm:text-2xl">
          Navis Docs helps teams capture, organize, and share SOPs, runbooks, and process knowledge from one place.
        </p>
        <div className="flex flex-row gap-2">
          <Button
            variant={"outline"}
          >
            <Link href={dashboardPath()}>Get Started</Link>
          </Button>
          <Button
            variant={"outline"}
          >
            <Link href={"https://github.com/eliott-herbert-byrnes/navis-docs"} target="_blank">
              Self Host
            </Link>
          </Button>
        </div>

      </section>

      <section aria-label="Product screenshot preview" className="py-24">
        <div className="flex justify-center sm:hidden">
          <Image
            className="h-auto w-full max-w-4xl"
            src="/webp/hero-iframe-image.webp"
            width={1460}
            height={730}
            alt={marketingAlt.heroProductUi}
            priority
            sizes="100vw"
          />
        </div>
        <div className="relative hidden sm:block">
          <div className="absolute inset-x-0 z-10 flex justify-center">
            {process.env.NEXT_PUBLIC_DEMO_URL ? (
              <iframe
                src={process.env.NEXT_PUBLIC_DEMO_URL}
                title="Navis Docs live demo"
                loading="lazy"
                className="aspect-[1460/730] w-full max-w-[1460px] rounded-lg border-4 border-secondary"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <Image
                className="h-auto w-auto"
                src="/webp/hero-iframe-image.webp"
                width={1460}
                height={730}
                alt={marketingAlt.heroProductUi}
              />
            )}
          </div>
          <div className="relative inset-x-0 z-0 w-full pt-90">
            <div className="relative mx-auto aspect-[1840/520] w-full max-w-[1840px]">
              <Image
                alt={marketingAlt.heroBackdrop}
                className="object-cover"
                fill
                sizes="(min-width: 1840px) 1840px, 100vw"
                src="/webp/iframe-background-image.webp"
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="company-logos">

        <div className="inset-x-0 flex justify-center">
          <p
            id="company-logos"
            className="text-muted-foreground text-xl sm:text-2xl"
          >
            Trusted by fast moving teams around the world
          </p>
        </div>

        <div className="py-24 flex flex-row flex-wrap gap-4 mx-auto justify-center">
          {companyLogos.map((logo) => (
            <div
              key={logo.id}
              className="flex items-center justify-center bg-card w-auto h-[4rem] sm:h-[4.5rem] md:h-[7.25rem] px-6 sm:px-8 md:px-12 rounded-lg"
            >
              <Image
                src={logo.src}
                width={150}
                height={150}
                alt={logo.alt}
                className="h-6 sm:h-7 md:h-8 w-25 sm:w-35 md:w-45 object-contain"
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="hero-feature-heading" className="py-0">
        <div className="flex flex-col gap-3">
          <h2
            id="hero-feature-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            Build around your organization
          </h2>
          <p className="text-muted-foreground text-xl sm:text-xl w-full sm:w-2/3 lg:w-1/3">
            Create your organisation, then structure it into departments and teams. Each team gets its own knowledge base.
          </p>
          <Link className="text-brand text-xl sm:text-xl hover:text-brand/75" href={"/docs"}>
            See the documentation →
          </Link>
        </div>

        <div className="mt-12 flex justify-center sm:hidden">
          <Image
            className="h-auto w-full max-w-2xl rounded-tl-lg rounded-tr-lg rounded-bl-lg border-4 border-secondary"
            src="/webp/hero-feature-image-2.webp"
            width={800}
            height={680}
            alt={marketingAlt.orgStructureUi}
            sizes="100vw"
          />
        </div>
        <div className="relative hidden sm:block">
          <div className="inset-x-0 z-10 mt-0 flex justify-end">
            <Image
              className="absolute rounded-tl-lg rounded-tr-lg rounded-bl-lg border-4 border-secondary z-10"
              src="/webp/hero-feature-image-2.webp"
              width={800}
              height={680}
              alt={marketingAlt.orgStructureUi}
              // sizes="(min-width: 1024px) 50vw, 80vw"
            />
          </div>
          <div className="relative inset-x-0 z-0 flex justify-end pt-90">
            <div className="relative ml-auto aspect-[1070/520] w-full max-w-[1070px]">
              <Image
                alt={marketingAlt.orgFeatureBackdrop}
                className="object-cover"
                fill
                sizes="(min-width: 1070px) 1070px, 100vw"
                src="/webp/feature-background-image.webp"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="sub-hero-feature"
        className="py-24"
        id="four-formats"
      >

        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xl sm:text-xl w-full sm:w-2/3 lg:w-1/3">
            Standardise
          </p>
          <h2
            id="sub-hero-feature"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            Four formats. One tool
          </h2>
          <Link className="text-brand text-xl sm:text-xl hover:text-brand/75" href={"/docs"}>
            See the documentation →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-12 sm:grid-cols-2 sm:pt-24 lg:grid-cols-4">
          {HeroFeature.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex flex-col bg-card p-8 rounded-lg gap-4 ">
                <div className="flex flex-row items-center gap-2">
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="font-serif text-2xl">{feature.title}</span>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

      </section>

      <section aria-labelledby="features-heading" className="py-12" id="features">
        <div className="flex flex-col gap-3 items-center text-center" >
          <p className="text-muted-foreground text-xl sm:text-xl w-full sm:w-2/3 lg:w-1/3">
            Features
          </p>
          <h2
            id="features-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            AI Integration - Bring Your Own Keys
          </h2>
          <Link className="text-brand text-xl sm:text-xl hover:text-brand/75" href={"/"}>
            See our roadmap →
          </Link>
        </div>

        <ul className="mx-auto grid w-full max-w-6xl list-none grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-24 px-4 sm:px-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.id}
                className="flex h-42 w-full min-w-0 flex-col rounded-lg bg-card p-5 text-left"
              >
                <div className="flex flex-row items-center gap-2">
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <h3 className="font-serif text-lg">
                    {feature.title}
                  </h3>
                </div>
                <p className="mt-3 min-h-0 flex-1 overflow-y-auto text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>

      </section>

      {/* <section aria-labelledby="testimonial-heading" className="py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="w-full shrink-0 lg:w-140">
            <Image
              className="h-auto w-full rounded-lg"
              src="/testimonial/ehb.png"
              width={760}
              height={900}
              alt="Eliott Herbert-Byrnes"
            />
          </div>
          <div className="flex flex-col gap-6 lg:p-24">
            <p
              id="testimonial-heading"
              className="font-serif text-3xl sm:text-4xl leading-14"
            >
              I spent years in risk operations watching colleagues lose critical minutes digging through outdated wikis for procedures that should have taken seconds to find. In live customer cases, that friction has real consequences. I built Navis Docs because I wanted a tool that actually solved the problem.
            </p>
            <p className="text-muted-foreground text-xl sm:text-xl w-full sm:w-2/3 lg:w-1/3">
              Eliott Herbert-Byrnes
            </p>
            <p className="text-brand text-xl sm:text-xl">Risk Operations Senior Coordinator, Capital One Bank</p>
          </div>
        </div>
      </section> */}

      <section aria-labelledby="faq-heading" className="py-12">
        <div className="flex flex-col gap-3">
          <h2
            id="faq-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            Questions?
          </h2>
          <p className="text-muted-foreground text-xl sm:text-xl w-full sm:w-2/3 lg:w-1/3">
            Find answers to common questions about Navis Docs. Can’t find what you’re looking for?
          </p>
          <Link className="text-brand text-xl sm:text-xl hover:text-brand/75" href={"/"}>
            Contact us →
          </Link>
        </div>

        <div className="flex justify-center pt-24">
          <SiteAccordion />
        </div>
      </section>

      <section aria-labelledby="get-started-heading" className="pt-12">
        <div className="flex flex-col gap-4 text-center justify-center items-center h-125 rounded-lg bg-card">
          <p className="text-muted-foreground text-xl sm:text-xl w-full sm:w-2/3 lg:w-1/3">
            Get Started
          </p>
          <h2
            id="get-started-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            Try Navis Docs now.
          </h2>
          <div className="flex flex-row gap-2">
            <Button
              variant={"outline"}
            >
              <Link href={dashboardPath()}>Cloud</Link>
            </Button>
            <Button
              variant={"outline"}
            >
              <Link href={"https://github.com/eliott-herbert-byrnes/navis-docs"} target="_blank">
                Self Host
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
