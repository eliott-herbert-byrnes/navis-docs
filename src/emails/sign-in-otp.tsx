import { Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/_components/email-layout";

export type SignInOtpEmailProps = {
  code: string;
};

export function SignInOtpEmail({ code }: SignInOtpEmailProps) {
  return (
    <EmailLayout
      preview={`Your Navis Docs sign-in code: ${code}`}
      footerText="If you did not request this code, you can safely ignore this email."
    >
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
    </EmailLayout>
  );
}

export default SignInOtpEmail;
