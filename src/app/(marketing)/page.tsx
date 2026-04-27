import type { Metadata } from "next";
import Link from "next/link";
import { companyLogos } from "@/app/(marketing)/_content/company-logos";
import { faqs } from "@/app/(marketing)/_content/faqs";
import { features } from "@/app/(marketing)/_content/features";
import { HeroFeature } from "@/app/(marketing)/_content/hero-features";
import { testimonials } from "@/app/(marketing)/_content/testimonials";
import { dashboardPath, signInPath } from "@/app/paths";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SiteAccordian } from "./_components/site-accordian";

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
    // <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
    <div className="grid grid-cols-12 space-y-16 px-12 py-24">

      <section aria-labelledby="hero-heading" className="col-span-6 col-start-1 space-y-4">
        <h1
          id="hero-heading"
          className="font-serif text-4xl sm:text-5xl leading-14"
        >
          The open-source platform for knowledge and SOP management
        </h1>
        <p className="text-muted-foreground text-1xl sm:text-2xl">
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

      <section aria-labelledby="hero-image" className="col-span-12 col-start-1 py-24">

        <div className="relative">
          <div className="z-10 absolute inset-x-0 flex justify-center">
            <Image
              className="w-auto h-auto"
              src="/hero-iframe-image.png"
              width={1460}
              height={730}
              alt=""
              priority
            />
          </div>
          <div className="z-0 relative inset-x-0  pt-90">
            <Image
              className="w-auto h-auto"
              src="/hero-background-image.png"
              width={1840}
              height={520}
              alt=""
              priority
            />
          </div>
        </div>

      </section>

      <section aria-labelledby="company-logos" className="col-span-12 col-start-1">

        <div className="inset-x-0 flex justify-center">
          <p className="text-muted-foreground text-1xl sm:text-2xl">
            Trusted by fast moving teams around the world
          </p>
        </div>

        <div className="py-24 flex flex-row gap-4 mx-auto justify-center">
          {companyLogos.map((logo) => (
            <div
              key={logo.id}
              className="flex items-center justify-center bg-card w-auto h-auto px-12 rounded-lg"
            >
              <Image
                src={logo.src}
                width={logo.width}
                height={logo.height}
                alt={logo.alt}
                priority
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="hero-feature" className="col-start-1 col-span-12 py-0">
        <div className="flex flex-col gap-3">
          <h2
            id="hero-feature-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            Build around your organization
          </h2>
          <p className="text-muted-foreground text-xl sm:text-1xl w-1/3">
            Create your organisation, then structure it into departments and teams. Each team gets its own knowledge base.
          </p>
          <Link className="text-brand text-xl sm:text-1xl hover:text-brand/75" href={"/"}>
            See the documentation →
          </Link>
        </div>

        <div className="relative">
          <div className="z-10 absolute inset-x-0 flex justify-end">
            <Image
              className="border-secondary border-4 rounded-tl-lg rounded-bl-lg rounded-tr-lg w-auto h-auto"
              src="/hero-feature-image-2.png"
              width={800}
              height={680}
              alt=""
              priority
            />
          </div>
          <div className="z-0 relative pt-90 inset-x-0 flex justify-end">
            <Image
              className="w-auto h-auto"
              src="/hero-feature-background-image-2.png"
              width={1070}
              height={520}
              alt=""
              priority
            />
          </div>
        </div>

      </section>

      <section aria-labelledby="sub-hero-feature" className="col-start-1 col-span-12 py-24">

        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xl sm:text-1xl w-1/3">
            Standardise
          </p>
          <h2
            id="hero-feature-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            Four formats. One tool
          </h2>
          <Link className="text-brand text-xl sm:text-1xl hover:text-brand/75" href={"/"}>
            See the documentation →
          </Link>
        </div>

        <div className="flex gap-6 pt-24">

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

      <section aria-labelledby="features-heading" className="col-start-1 col-span-12 py-12">
        <div className="flex flex-col gap-3 items-center text-center">
          <p className="text-muted-foreground text-xl sm:text-1xl w-1/3">
            Features
          </p>
          <h2
            id="features-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            AI Integration - Bring Your Own Keys
          </h2>
          <Link className="text-brand text-xl sm:text-1xl hover:text-brand/75" href={"/"}>
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

      <section aria-labelledby="testimonial-heading" className="col-start-1 col-span-12 py-12">
        <div className="flex">
          <Image
            className="w-auto h-auto"
            src="/testimonial/ehb.png"
            width={760}
            height={900}
            alt=""
            priority
          />
          <div className="flex flex-col gap-6 px-48 my-auto">
            <p className="font-serif text-3xl sm:text-4xl leading-14">I spent years in risk operations watching colleagues lose critical minutes digging through outdated wikis for procedures that should have taken seconds to find. In live customer cases, that friction has real consequences. I built Navis Docs because I wanted a tool that actually solved the problem.
            </p>
            <p className="text-muted-foreground text-xl sm:text-1xl w-1/3">
              Eliott Herbert-Byrnes
            </p>
            <p className="text-brand text-xl sm:text-1xl">Risk Operations Senior Coordinator, Capital One Bank</p>
          </div>
        </div>

      </section>

      <section aria-labelledby="faq-heading" className="col-start-1 col-span-12 py-12">
        <div className="flex flex-col gap-3">
          <h2
            id="faq-heading"
            className="font-serif text-3xl sm:text-4xl leading-14"
          >
            Questions?
          </h2>
          <p className="text-muted-foreground text-xl sm:text-1xl w-1/3">
            Find answers to common questions about Navis Docs. Can’t find what you’re looking for?
          </p>
          <Link className="text-brand text-xl sm:text-1xl hover:text-brand/75" href={"/"}>
            Contact us →
          </Link>
        </div>

        <div className="flex justify-center pt-24">
          <SiteAccordian />
        </div>
      </section>

      <section
        aria-labelledby="get-started"
        className="col-start-1 col-span-12 pt-12"
      >
        <div className="flex flex-col gap-4 text-center justify-center items-center h-125 rounded-lg bg-card">
          <p className="text-muted-foreground text-xl sm:text-1xl w-1/3">
            Get Started
          </p>
          <h2
            id="features-heading"
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
