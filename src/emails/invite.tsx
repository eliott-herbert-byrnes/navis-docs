import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/_components/email-layout";

export type InviteEmailProps = {
  orgName: string;
  inviteUrl: string;
};

export function InviteEmail({ orgName, inviteUrl }: InviteEmailProps) {
  return (
    <EmailLayout
      preview={`You've been invited to join ${orgName} on Navis Docs`}
      footerText="This invitation expires in 7 days. If you were not expecting this, you can ignore this email."
    >
      <Section className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 m-0">
          You've been invited
        </Text>
      </Section>
      <Section className="mb-6">
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          You have been invited to join <strong>{orgName}</strong> on Navis Docs.
        </Text>
        <Text className="text-base leading-relaxed text-gray-700 mb-4">
          Click the button below to accept your invitation and get started.
        </Text>
      </Section>
      <Section className="mb-6 text-center">
        <Button
          href={inviteUrl}
          className="bg-brand text-white font-semibold rounded-md px-6 py-3 text-sm no-underline"
        >
          Accept invitation
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default InviteEmail;
