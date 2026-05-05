import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/_components/email-layout";

export type TrialStartedEmailProps = {
  orgName: string;
  ownerName: string;
  trialEndsAt: Date;
  billingUrl: string;
};

function formatTrialEnd(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export function TrialStartedEmail({
  orgName,
  ownerName,
  trialEndsAt,
  billingUrl,
}: TrialStartedEmailProps) {
  return (
    <EmailLayout
      preview={`Your 14-day free trial for ${orgName} on Navis Docs has started`}
      footerText="You are receiving this email because you created this organisation on Navis Docs."
    >
      <Section className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 m-0">
          Welcome to Navis Docs
        </Text>
      </Section>
      <Section className="mb-6">
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Hi {ownerName},
        </Text>
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Your 14-day free trial has started for{" "}
          <strong>{orgName}</strong>. You have full access to create and manage
          documentation during your trial.
        </Text>
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Your trial ends on{" "}
          <strong>{formatTrialEnd(trialEndsAt)}</strong>. Add a payment method
          before then to keep uninterrupted access, or subscribe anytime from
          your billing page.
        </Text>
      </Section>
      <Section className="mb-6 text-center">
        <Button
          href={billingUrl}
          className="bg-brand text-white font-semibold rounded-md px-6 py-3 text-sm no-underline"
        >
          View subscription
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default TrialStartedEmail;
