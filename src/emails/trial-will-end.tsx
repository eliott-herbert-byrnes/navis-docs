import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/_components/email-layout";
import { getSubscriptionUrlForEmail } from "@/lib/email";

export type TrialWillEndEmailProps = {
  orgName: string;
  ownerName: string;
  daysRemaining: number;
};

export function TrialWillEndEmail({
  orgName,
  ownerName,
  daysRemaining,
}: TrialWillEndEmailProps) {
  const dayLabel = daysRemaining === 1 ? "day" : "days";

  return (
    <EmailLayout
      preview={`Your Navis Docs trial for ${orgName} ends in ${daysRemaining} ${dayLabel} — add a payment method to keep access`}
      footerText="You are receiving this because you are the organisation owner on Navis Docs."
    >
      <Section className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 m-0">
          Your trial ends in {daysRemaining} {dayLabel}
        </Text>
      </Section>
      <Section className="mb-6">
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Hi {ownerName},
        </Text>
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          The free trial for <strong>{orgName}</strong> on Navis Docs ends in{" "}
          {daysRemaining} {dayLabel}. Add a payment method now to keep full
          access when the trial period closes.
        </Text>
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Without a payment method, your organisation may move to read-only mode
          after the trial ends.
        </Text>
      </Section>
      <Section className="mb-6 text-center">
        <Button
          href={getSubscriptionUrlForEmail()}
          className="bg-brand text-black font-semibold rounded-md px-6 py-3 text-sm no-underline"
        >
          Add payment method
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default TrialWillEndEmail;
