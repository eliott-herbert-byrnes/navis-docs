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

export type TrialWillEndEmailProps = {
  orgName: string;
  ownerName: string;
  billingUrl: string;
};

export function TrialWillEndEmail({
  orgName,
  ownerName,
  billingUrl,
}: TrialWillEndEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Your Navis Docs trial for {orgName} ends in 3 days — add a payment
        method to keep access
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800">
          <Container className="bg-white shadow-sm rounded-lg my-10 mx-auto p-8 max-w-[560px] mb-16">
            <div className="flex flex-row items-center gap-2">
              <Text className="font-serif text-3xl">Navis Docs</Text>
            </div>
            <Section className="mb-6">
              <Text className="text-2xl font-bold text-gray-900 m-0">
                Your trial ends in 3 days
              </Text>
            </Section>
            <Section className="mb-6">
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                Hi {ownerName},
              </Text>
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                The free trial for <strong>{orgName}</strong> on Navis Docs ends
                in 3 days. Add a payment method now to keep full access when the
                trial period closes.
              </Text>
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                Without a payment method, your organisation may move to read-only
                mode after the trial ends.
              </Text>
            </Section>
            <Section className="mb-6 text-center">
              <Button
                href={billingUrl}
                className="bg-gray-700 text-white font-semibold rounded-md px-6 py-3 text-sm no-underline"
              >
                Add payment method
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

export default TrialWillEndEmail;
