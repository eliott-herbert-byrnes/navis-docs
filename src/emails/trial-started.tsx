import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

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
    <Html lang="en">
      <Head />
      <Preview>
        Your 14-day free trial for {orgName} on Navis Docs has started
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800">
          <Container className="bg-white shadow-sm rounded-lg my-10 mx-auto p-8 max-w-[560px] mb-16">
            <div className="flex flex-row items-center gap-2">
              <Text className="font-serif text-3xl">Navis Docs</Text>
            </div>
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
                <strong>{orgName}</strong>. You have full access to create and
                manage documentation during your trial.
              </Text>
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                Your trial ends on{" "}
                <strong>{formatTrialEnd(trialEndsAt)}</strong>. Add a payment
                method before then to keep uninterrupted access, or subscribe
                anytime from your billing page.
              </Text>
            </Section>
            <Section className="mb-6 text-center">
              <Button
                href={billingUrl}
                className="bg-gray-700 text-white font-semibold rounded-md px-6 py-3 text-sm no-underline"
              >
                View subscription
              </Button>
            </Section>
            <hr className="border border-gray-200 my-5" />
            <Text className="text-xs text-gray-400 leading-4 mt-6">
              You are receiving this email because you created this organisation
              on Navis Docs.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default TrialStartedEmail;
