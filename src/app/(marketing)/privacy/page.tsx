import type { Metadata } from "next";

import { LegalPageLayout } from "@/app/(marketing)/_components/legal-page-layout";

const description =
  "How Navis Docs collects, uses, and protects your data — including authentication, cookies, third-party subprocessors, and AI features.";

export const metadata: Metadata = {
  title: "Privacy policy",
  description,
  openGraph: {
    title: "Privacy policy | Navis Docs",
    description,
  },
  twitter: {
    title: "Privacy policy | Navis Docs",
    description,
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy policy" lastUpdated="April 28, 2026">
      <h2 id="overview">Overview</h2>
      <p>
        Navis Docs is an open-source, privacy-conscious knowledge and standard
        operating procedure (SOP) management platform. This policy explains what
        data we collect when you use the cloud-hosted service, how we use it,
        and who we share it with.
      </p>
      <p>
        For self-hosted deployments, all data remains on your own
        infrastructure. This policy applies only to the Navis Docs cloud
        service.
      </p>

      <h2 id="data-we-collect">What We Collect</h2>

      <h3>Account data</h3>
      <p>When you create an account we store:</p>
      <ul>
        <li>Email address and a normalised canonical form of it</li>
        <li>Display name</li>
        <li>Profile picture (Google OAuth sign-in only)</li>
        <li>Email verification status and account creation date</li>
      </ul>

      <h3>Authentication data</h3>
      <p>
        We support two sign-in methods. Depending on which you use, we store
        additional data:
      </p>
      <ul>
        <li>
          <strong>Google OAuth:</strong> OAuth tokens (access token, refresh
          token, ID token) are stored in our database to maintain your session
          and are provided by Google at sign-in.
        </li>
        <li>
          <strong>Email one-time password (OTP):</strong> A 5-digit code is
          emailed to you via Resend. We store only a cryptographic hash of the
          code — the plaintext code is never stored and cannot be recovered by
          us.
        </li>
      </ul>

      <h3>Organisation data</h3>
      <p>
        When you create or belong to an organisation we store its name, URL
        slug, your role within it, your subscription plan, and Stripe billing
        identifiers.
      </p>
      <p>
        Navis Docs cloud does not offer AI features and does not store
        organisation AI API keys for product use. If you run a self-hosted
        instance and your organisation enables AI there, an encrypted copy of
        your Anthropic or OpenAI API key may be stored in that instance&rsquo;s
        database.
      </p>

      <h3>Address book</h3>
      <p>
        The address book feature allows your organisation to store contact
        records (name, email, phone, postal address, website). This data is
        entered and managed entirely by your organisation. See the{" "}
        <a href="#address-book">User-Managed Contact Data</a> section for your
        responsibilities as the data controller.
      </p>

      <h3>Activity data</h3>
      <p>We record the following to power in-app features:</p>
      <ul>
        <li>Which procedures you have marked as favourites</li>
        <li>
          Which procedures and news posts you have read (used to show read-state
          indicators in the UI)
        </li>
        <li>
          Audit log entries: actor, action, timestamp, and a JSON snapshot of
          the changed record — used for your organisation&rsquo;s compliance
          features
        </li>
      </ul>

      <h3>AI chat content</h3>
      <p>
        Navis Docs cloud does not include an AI assistant. If you use a
        self-hosted instance with AI enabled, your messages and relevant
        knowledge base context are sent to Anthropic&rsquo;s API from that
        deployment. See the{" "}
        <a href="#ai-features">AI Features and Data Processing</a> section for
        details.
      </p>

      <h2 id="how-we-use-data">How We Use Your Data</h2>
      <p>We use the data we collect exclusively to:</p>
      <ul>
        <li>Authenticate you and maintain your session</li>
        <li>Provide and improve the Navis Docs service</li>
        <li>
          Send transactional emails (OTP codes, team invitations, billing
          notifications)
        </li>
        <li>Process subscription billing via Stripe</li>
        <li>Enforce rate limits to protect service availability</li>
        <li>
          Power AI assistant responses on self-hosted deployments when the
          feature is enabled (not available on Navis Docs cloud)
        </li>
      </ul>
      <p>
        We will never sell your data or use it for advertising. Your
        organisation&rsquo;s knowledge base content and documents are yours.
      </p>

      <h2 id="cookies">Cookies and Local Storage</h2>
      <p>
        Navis Docs uses a small number of cookies and browser storage
        mechanisms, described below.
      </p>

      <h3>Cookies</h3>
      <ul>
        <li>
          <strong>Session cookie</strong> — an encrypted JWT cookie set by
          Auth.js to keep you signed in. This cookie is essential for the
          service to function and cannot be opted out of while you are logged
          in.
        </li>
        <li>
          <strong>
            <code>sidebar_state</code>
          </strong>{" "}
          — stores whether the application sidebar is open or collapsed. This is
          a UI-only preference with a 7-day expiry and contains no personal
          data.
        </li>
      </ul>

      <h3>Browser storage (not cookies)</h3>
      <ul>
        <li>
          <strong>sessionStorage</strong> — on self-hosted instances with AI
          enabled, chat message history is stored per team in your
          browser&rsquo;s sessionStorage. This data is never sent to Navis Docs
          servers or any analytics vendor; it exists only in your browser tab
          and is cleared when the tab is closed.
        </li>
        <li>
          <strong>localStorage</strong> — your theme preference (light or dark)
          is stored in localStorage by the theme provider. This data never
          leaves your device.
        </li>
      </ul>

      <h2 id="ai-features">AI Features and Data Processing</h2>
      <p>
        <strong>Navis Docs cloud does not offer AI features.</strong> Cloud users
        do not send chat messages or knowledge base context to Anthropic through
        the Navis Docs cloud service.
      </p>
      <p>
        On self-hosted deployments with AI enabled, messages and relevant
        sections of your knowledge base are sent to{" "}
        <a
          href="https://www.anthropic.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Anthropic
        </a>{" "}
        for processing via their API. Anthropic does not use API request data to
        train their models.
      </p>
      <p>
        On self-hosted instances, AI features are only active if your
        organisation or deployment has configured the required API keys. If no
        key has been configured, no data is sent to Anthropic.
      </p>
      <p>
        AI chat messages are not stored on Navis Docs servers. On self-hosted
        instances they are persisted temporarily in your browser&rsquo;s
        sessionStorage (see above) and cleared when you close the tab.
      </p>

      <h2 id="subprocessors">Third-Party Subprocessors</h2>
      <p>
        We share data with the following third-party processors in order to
        provide the service:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Data received</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google</td>
              <td>OAuth authentication</td>
              <td>Account ID, email, display name, profile picture</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Transactional email (OTP codes, invitations)</td>
              <td>Recipient email address</td>
            </tr>
            <tr>
              <td>Stripe</td>
              <td>Billing and subscription management</td>
              <td>Email address, organisation name, subscription metadata</td>
            </tr>
            <tr>
              <td>Anthropic</td>
              <td>AI assistant responses (self-hosted only)</td>
              <td>
                Not used by Navis Docs cloud. On self-hosted instances with AI
                enabled: chat message content and knowledge base context
              </td>
            </tr>
            <tr>
              <td>Supabase</td>
              <td>File storage</td>
              <td>Uploaded files (document imports, images, audit exports)</td>
            </tr>
            <tr>
              <td>Upstash</td>
              <td>Rate limiting</td>
              <td>
                User ID and IP address (used to enforce request-rate limits)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="ip-addresses">IP Addresses</h2>
      <p>
        IP addresses are used by Upstash Redis to enforce rate limits on
        incoming requests. They are not stored in our primary database and are
        not used for analytics, tracking, or any purpose other than preventing
        abuse.
      </p>

      <h2 id="address-book">User-Managed Contact Data</h2>
      <p>
        If your organisation uses the address book feature to store contact
        details for third parties (customers, suppliers, or other contacts), you
        are acting as the data controller for that information. You are
        responsible for ensuring you have an appropriate legal basis to store
        those details and that doing so complies with any applicable privacy
        laws in your jurisdiction.
      </p>
      <p>
        Navis Docs processes this data on your behalf as a data processor and
        will not use it for any purpose beyond providing the service to your
        organisation.
      </p>

      <h2 id="data-ownership">Data Ownership</h2>
      <p>
        You retain all rights to your organisation&rsquo;s knowledge base,
        documents, and SOPs. We will never sell or share your content with third
        parties. We act only as a processor of that data on your behalf.
      </p>
      <p>
        For self-hosted Navis Docs instances, all data remains exclusively on
        your own servers and under your full control.
      </p>

      <h2 id="gdpr">GDPR and Privacy Regulations</h2>
      <p>
        Navis Docs is designed with privacy regulations in mind, including the
        GDPR, CCPA, and the UK GDPR:
      </p>
      <ul>
        <li>We collect only the data necessary to provide the service</li>
        <li>We do not track users across different websites or services</li>
        <li>We do not sell personal data or share it with advertisers</li>
        <li>
          You may request deletion of your account and associated personal data
          by contacting us at{" "}
          <a href="mailto:hello@navisdocs.com">hello@navisdocs.com</a>
        </li>
      </ul>

      <h2 id="security">Security Measures</h2>
      <p>
        For the cloud service, we implement appropriate technical and
        organisational security measures to protect your data. These include
        encrypted storage of sensitive values (such as API keys), hashed storage
        of OTP codes, and HTTPS for all data in transit.
      </p>
      <p>
        For self-hosted instances, security is the responsibility of your
        infrastructure administrators.
      </p>

      <h2 id="open-source">Open Source Transparency</h2>
      <p>
        As an open-source project, our code is publicly available for
        independent review. This includes our data collection mechanisms, which
        you can audit to verify the claims in this policy.
      </p>
      <p>
        <a
          href="https://github.com/navis-docs/navis-docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          View our GitHub repository &rarr;
        </a>
      </p>

      <h2 id="changes">Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically to reflect changes in our
        practices or for legal reasons. We will post the updated policy on this
        page with a revised date. For material changes, we will notify users by
        email where possible.
      </p>

      <h2 id="contact">Contact Us</h2>
      <p>
        If you have questions about this policy or our data practices, please
        contact us at:{" "}
        <a href="mailto:hello@navisdocs.com">hello@navisdocs.com</a>
      </p>
    </LegalPageLayout>
  );
}
