import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export type SignInOtpEmailProps = {
  code: string;
};

export function SignInOtpEmail({ code }: SignInOtpEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your Navis Docs sign-in code: {code}</Preview>
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
                Your sign-in code
              </Text>
            </Section>
            <Section className="mb-4">
              <Text className="text-base leading-relaxed text-gray-700 mb-2">
                Use the code below to sign in to Navis Docs. It expires in{" "}
                <strong>10 minutes</strong>.
              </Text>
            </Section>
            <Section className="my-6 text-center">
              <Text className="text-5xl font-bold tracking-widest text-gray-900 font-mono m-0">
                {code}
              </Text>
            </Section>
            <hr className="border border-gray-200 my-5" />
            <Text className="text-xs text-gray-400 leading-4 mt-6">
              If you did not request this code, you can safely ignore this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default SignInOtpEmail;
