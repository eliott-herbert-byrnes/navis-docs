import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export type InviteEmailProps = {
  orgName: string;
  inviteUrl: string;
};

export function InviteEmail({ orgName, inviteUrl }: InviteEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You've been invited to join {orgName} on Navis Docs</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800">
          <Container className="bg-white shadow-sm rounded-lg my-10 mx-auto p-8 max-w-[560px] mb-16">
          <div className="flex flex-row items-center gap-2">
              <Img src="https://navisdocs.com/nd-square-blue-png.png" width={35} height={35} alt="Navis Docs Logo" />
              <Text className="font-serif text-3xl">
                Navis Docs
              </Text>
            </div>
            <Section className="mb-6">
              <Text className="text-2xl font-bold text-gray-900 m-0">
                You've been invited
              </Text>
            </Section>
            <Section className="mb-6">
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                You have been invited to join{" "}
                <strong>{orgName}</strong> on Navis Docs.
              </Text>
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                Click the button below to accept your invitation and get
                started.
              </Text>
            </Section>
            <Section className="mb-6 text-center">
              <Button
                href={inviteUrl}
                className="bg-gray-700 text-white font-semibold rounded-md px-6 py-3 text-sm no-underline"
              >
                Accept invitation
              </Button>
            </Section>
            <hr className="border border-gray-200 my-5" />
            <Text className="text-xs text-gray-400 leading-4 mt-6">
              This invitation expires in 7 days. If you were not expecting this,
              you can ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default InviteEmail;
