import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout } from "@/app/(marketing)/_components/legal-page-layout";

const description =
  "Terms and Conditions governing use of the Navis Docs cloud service, including subscriptions, seat-based billing, data ownership, and acceptable use.";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description,
  openGraph: {
    title: "Terms and Conditions | Navis Docs",
    description,
  },
  twitter: {
    title: "Terms and Conditions | Navis Docs",
    description,
  },
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms and Conditions" lastUpdated="April 28, 2026">
      <h2 id="acceptance">Acceptance of Terms</h2>
      <p>
        By accessing and using Navis Docs, you accept and agree to be bound by
        the terms and provisions of this agreement. If you do not agree to these
        terms, please do not use our service.
      </p>

      <h2 id="description">Description of Service</h2>
      <p>
        Navis Docs is an open-source, privacy-friendly knowledge and standard
        operating procedure (SOP) management platform. We provide both a
        cloud-hosted service and self-hosted software that enables teams and
        organisations to create, manage, and share internal knowledge,
        procedures, and documentation.
      </p>

      <h2 id="use">Use of Service</h2>

      <h3>Acceptable Use</h3>
      <p>
        You agree to use Navis Docs only for lawful purposes and in accordance
        with these Terms. You agree not to:
      </p>
      <ul>
        <li>
          Use the service in any way that violates any applicable law or
          regulation
        </li>
        <li>
          Attempt to gain unauthorised access to any portion of the service
        </li>
        <li>Interfere with or disrupt the service or servers</li>
        <li>
          Use the service to collect personally identifiable information without
          proper consent
        </li>
        <li>Resell or redistribute the cloud service without authorisation</li>
      </ul>

      <h3>Account Responsibilities</h3>
      <p>For cloud service users:</p>
      <ul>
        <li>
          You must be a human — accounts registered by bots or automated methods
          are not permitted
        </li>
        <li>
          You must provide accurate, complete, and current information when
          creating an account
        </li>
        <li>
          You are responsible for maintaining the confidentiality of your
          account credentials
        </li>
        <li>
          You are responsible for all activities that occur under your account
        </li>
        <li>
          You must notify us immediately of any unauthorised use of your account
        </li>
      </ul>

      <h2 id="license">Open Source Licence</h2>
      <p>
        Navis Docs is open-source software released under the{" "}
        <Link href="/license">AGPL-3.0 Licence</Link>. The self-hosted version
        is free to use, modify, and distribute according to the terms of that
        licence. These Terms and Conditions apply specifically to the use of our
        cloud-hosted service and website.
      </p>

      <h2 id="billing">Subscription and Billing</h2>

      <h3>Payment Terms</h3>
      <p>For paid cloud subscriptions:</p>
      <ul>
        <li>
          Payment is processed via credit card or other accepted payment methods
          through Stripe
        </li>
        <li>
          Subscriptions are billed on a monthly or annual basis as selected
          during sign-up
        </li>
        <li>All fees are in USD unless otherwise stated</li>
        <li>
          You authorise us to charge your payment method automatically on each
          billing cycle
        </li>
        <li>
          No surprise fees — your card will never be charged unexpectedly
        </li>
      </ul>

      <h3>Seat-Based Billing</h3>
      <p>
        Subscriptions are priced per <strong>seat</strong>. A seat is an active
        user membership within your organisation. You are billed for the number
        of seats on your plan at each billing cycle.
      </p>
      <ul>
        <li>
          Adding seats within your current plan limit does not immediately
          change your bill — it is reflected on your next billing cycle or as a
          prorated charge, depending on your plan
        </li>
        <li>
          Removing seats takes effect at the end of the current billing period
        </li>
        <li>
          Failed payments may result in service suspension or termination after
          notice
        </li>
      </ul>

      <h3>Auto-Renewal and Price Changes</h3>
      <p>
        Your subscription will automatically renew at the end of each billing
        period unless you cancel before the renewal date. We reserve the right
        to modify subscription prices with at least 30 days&rsquo; advance
        notice. Price changes will take effect on your next billing cycle.
        Continued use of the service after a price change constitutes acceptance
        of the new pricing.
      </p>

      <h3>Plan Limits and Upgrades</h3>
      <p>
        Each plan includes a specific number of seats. If you need to add
        members beyond your plan&rsquo;s seat limit, you may be prompted to
        upgrade to a higher tier. We will notify you when you approach your
        plan&rsquo;s limits. We reserve the right to enforce fair use policies
        to prevent abuse.
      </p>

      <h2 id="cancellation">Cancellation and Downgrade</h2>

      <h3>How to Cancel</h3>
      <p>
        You may cancel your subscription at any time through your account
        settings or by contacting support. Cancellations take effect at the end
        of your current billing period. You will retain access to paid features
        until that time.
      </p>

      <h3>Downgrading Your Plan</h3>
      <p>
        You may downgrade to a lower-tier plan or the free tier at any time.
        Downgrades take effect at the end of your current billing period. If the
        number of active seats in your organisation exceeds the limit of the
        downgraded plan, you may need to reduce the number of members before the
        downgrade takes effect.
      </p>

      <h3>Data After Cancellation</h3>
      <p>
        After cancellation we will contact you regarding options for exporting
        your organisation&rsquo;s data before account closure. We recommend
        exporting your data before cancelling if you wish to retain it. We will
        provide reasonable notice before any permanent deletion of data. This
        section will be updated with a specific retention period before the
        general availability launch of Navis Docs.
      </p>

      <h2 id="availability">Service Availability</h2>
      <p>
        We strive to provide reliable service but do not guarantee uninterrupted
        access. We reserve the right to modify, suspend, or discontinue any part
        of the service at any time with or without notice. We are not liable for
        any modification, suspension, or discontinuation of the service.
      </p>

      <h2 id="data">Data and Privacy</h2>

      <h3>Your Data Ownership</h3>
      <p>
        You retain all rights to your organisation&rsquo;s knowledge base, SOP
        documents, and organisational data. We will never sell or share your
        content with any third parties. Your data is yours, and we act only as a
        processor of that data on your behalf.
      </p>

      <h3>Privacy Commitment</h3>
      <p>
        Navis Docs is designed to be privacy-conscious and compliant with GDPR,
        CCPA, and other privacy regulations. Our full data practices are
        described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h3>Your Compliance Obligations</h3>
      <p>
        You are responsible for ensuring your use of Navis Docs complies with
        all applicable privacy laws and regulations in your jurisdiction. If you
        store third-party contact data (for example, in the address book
        feature), you must ensure you have the appropriate legal basis to do so.
      </p>

      <h2 id="ip">Intellectual Property</h2>
      <p>
        The Navis Docs name, logo, and branding are the property of Navis Docs.
        The open-source code is available under the AGPL-3.0 Licence. All other
        content on this website, including text, graphics, and documentation, is
        protected by copyright and other intellectual property laws.
      </p>

      <h2 id="liability">Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Navis Docs and its contributors
        shall not be liable for any indirect, incidental, special, consequential,
        or punitive damages, or any loss of profits or revenues, whether incurred
        directly or indirectly, or any loss of data, use, goodwill, or other
        intangible losses resulting from:
      </p>
      <ul>
        <li>Your use or inability to use the service</li>
        <li>
          Any unauthorised access to or use of our servers and/or any personal
          information stored therein
        </li>
        <li>
          Any interruption or cessation of transmission to or from the service
        </li>
        <li>
          Any bugs, viruses, or other harmful code that may be transmitted
          through the service
        </li>
        <li>
          Any errors or omissions in any content or for any loss or damage
          incurred from use of any content
        </li>
      </ul>

      <h2 id="warranty">Disclaimer of Warranties</h2>
      <p>
        The service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS
        AVAILABLE&rdquo; basis without any warranties of any kind, whether
        express or implied. We do not warrant that the service will be
        uninterrupted, secure, or error-free, or that any defects will be
        corrected.
      </p>

      <h2 id="termination">Termination</h2>
      <p>
        We reserve the right to terminate or suspend your account and access to
        the service immediately, without prior notice or liability, for any
        reason, including breach of these Terms. Upon termination, your right to
        use the service will cease immediately.
      </p>

      <h2 id="indemnification">Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Navis Docs and its contributors
        from any claims, damages, losses, liabilities, and expenses (including
        legal fees) arising from your use of the service or violation of these
        Terms.
      </p>

      <h2 id="governing-law">Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with
        applicable laws, without regard to conflict of law provisions. Any
        disputes arising from these Terms or use of the service shall be
        resolved in appropriate courts.
      </p>

      <h2 id="changes">Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will notify
        users of any material changes by posting the updated Terms on this page
        with a revised date. Your continued use of the service after such
        changes constitutes acceptance of the modified Terms.
      </p>

      <h2 id="severability">Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable or invalid,
        that provision will be limited or eliminated to the minimum extent
        necessary so that these Terms will otherwise remain in full force and
        effect.
      </p>

      <h2 id="entire-agreement">Entire Agreement</h2>
      <p>
        These Terms, along with our <Link href="/privacy">Privacy Policy</Link>,
        constitute the entire agreement between you and Navis Docs regarding the
        use of the service and supersede any prior agreements.
      </p>

      <h2 id="contact">Contact Information</h2>
      <p>
        If you have any questions about these Terms and Conditions, please
        contact us at:{" "}
        <a href="mailto:hello@navisdocs.com">hello@navisdocs.com</a>
      </p>
    </LegalPageLayout>
  );
}
