import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/_components/email-layout";

export type SubscriptionEndedEmailProps = {
  orgName: string;
  ownerName: string;
  billingUrl: string;
};

export function SubscriptionEndedEmail({
  orgName,
  ownerName,
  billingUrl,
}: SubscriptionEndedEmailProps) {
  return (
    <EmailLayout
      preview={`Your Navis Docs trial or subscription for ${orgName} has ended — your organisation is now read-only`}
      footerText="You are receiving this because you are the organisation owner on Navis Docs."
    >
      <Section className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 m-0">
          Trial or subscription ended
        </Text>
      </Section>
      <Section className="mb-6">
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Hi {ownerName},
        </Text>
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Your trial or subscription for <strong>{orgName}</strong> on Navis
          Docs has ended. Your organisation is now in <strong>read-only</strong>{" "}
          mode: you can view existing content, but creating or editing
          documentation requires an active subscription.
        </Text>
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Subscribe to restore full access for your team.
        </Text>
      </Section>
      <Section className="mb-6 text-center">
        <Button
          href={billingUrl}
          className="bg-brand text-white font-semibold rounded-md px-6 py-3 text-sm no-underline"
        >
          Subscribe
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default SubscriptionEndedEmail;
