import type { Metadata } from "next";

import { LegalPageLayout } from "@/app/(marketing)/_components/legal-page-layout";

const description =
  "Navis Docs is open-source software released under the GNU Affero General Public License v3.0 (AGPL-3.0).";

export const metadata: Metadata = {
  title: "License",
  description,
  openGraph: {
    title: "License | Navis Docs",
    description,
  },
  twitter: {
    title: "License | Navis Docs",
    description,
  },
};

export default function LicensePage() {
  return (
    <LegalPageLayout title="License" lastUpdated="April 28, 2026">
      <h2>GNU Affero General Public License v3.0</h2>
      <p>
        Navis Docs is free and open-source software, released under the{" "}
        <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong>.
      </p>
      <p>What this means in practice:</p>
      <ul>
        <li>
          <strong>Free to use and self-host.</strong> You may download, run, and
          modify Navis Docs on your own infrastructure at no cost.
        </li>
        <li>
          <strong>Modifications must be shared.</strong> If you modify Navis
          Docs and make it available to others over a network (for example, by
          running it as a service), you must also make your modified source code
          publicly available under the same licence.
        </li>
        <li>
          <strong>Attribution must be preserved.</strong> Copyright notices and
          licence headers in the source files must remain intact.
        </li>
        <li>
          <strong>No additional restrictions.</strong> You may not impose
          further restrictions on the rights granted by this licence.
        </li>
      </ul>
      <p>
        The AGPL-3.0 is specifically designed for software used over a network.
        It closes the &ldquo;SaaS loophole&rdquo; present in the GPL, ensuring
        that improvements to network-hosted software remain available to the
        community.
      </p>
      <p>
        <a
          href="https://www.gnu.org/licenses/agpl-3.0.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the full AGPL-3.0 licence text on gnu.org &rarr;
        </a>
      </p>

      <h2>Source Code</h2>
      <p>
        The complete source code for Navis Docs is publicly available. You are
        welcome to audit the code, report issues, or contribute improvements.
      </p>
      <p>
        <a
          href="https://github.com/eliott-herbert-byrnes/navis-docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Navis Docs on GitHub &rarr;
        </a>
      </p>

      <h2>Cloud Service</h2>
      <p>
        Use of the Navis Docs cloud-hosted service is additionally governed by
        our{" "}
        <a href="/terms">Terms and Conditions</a>. The AGPL-3.0 licence covers
        the software itself; the Terms govern the service we operate on your
        behalf.
      </p>
    </LegalPageLayout>
  );
}
