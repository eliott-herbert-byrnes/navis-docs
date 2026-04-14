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
    <Html lang="en">
      <Head />
      <Preview>
        Your Navis Docs trial or subscription for {orgName} has ended — your
        organisation is now read-only
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800">
          <Container className="bg-white shadow-sm rounded-lg my-10 mx-auto p-8 max-w-[560px] mb-16">
            <div className="flex flex-row items-center gap-2">
              <Text className="font-serif text-3xl">Navis Docs</Text>
            </div>
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
                Your trial or subscription for <strong>{orgName}</strong> on
                Navis Docs has ended. Your organisation is now in{" "}
                <strong>read-only</strong> mode: you can view existing content,
                but creating or editing documentation requires an active
                subscription.
              </Text>
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                Subscribe to restore full access for your team.
              </Text>
            </Section>
            <Section className="mb-6 text-center">
              <Button
                href={billingUrl}
                className="bg-gray-700 text-white font-semibold rounded-md px-6 py-3 text-sm no-underline"
              >
                Subscribe
              </Button>
            </Section>
            <hr className="border border-gray-200 my-5" />
            <Text className="text-xs text-gray-400 leading-4 mt-6">
              You are receiving this because you are the organisation owner on
              Navis Docs.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default SubscriptionEndedEmail;
