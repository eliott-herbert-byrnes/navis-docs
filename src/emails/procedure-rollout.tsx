import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export type ProcedureRolloutEmailProps = {
  procedureTitle: string;
  categoryName?: string | null;
  departmentName?: string | null;
  teamName?: string | null;
  bodyText?: string;
};

const defaultBodyText =
  "A new or updated procedure has been published and is available for you to read. Please review it and mark as read.";

export function ProcedureRolloutEmail({
  procedureTitle,
  categoryName,
  departmentName,
  teamName,
  bodyText = defaultBodyText,
}: ProcedureRolloutEmailProps) {
  const contextParts = [teamName, departmentName, categoryName].filter(
    (s): s is string => !!s,
  );
  const contextLine =
    contextParts.length > 0 ? `(${contextParts.join(" · ")})` : null;

  return (
    <Html lang="en">
      <Head />
      <Preview>New procedure: {procedureTitle}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800">
          <Container className="bg-white shadow-sm rounded-lg my-10 mx-auto p-8 max-w-[560px] mb-16">
            <Section className="mb-6">
              <Text className="text-2xl font-bold text-gray-900 m-0">
                Procedure published
              </Text>
            </Section>
            <Section className="mb-4">
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                <strong>{procedureTitle}</strong>
                {contextLine && (
                  <>
                    {" "}
                    <span className="text-sm text-gray-500">{contextLine}</span>
                  </>
                )}
              </Text>
            </Section>
            <hr className="border border-gray-200 my-5" />
            <Section className="mb-4">
              <Text className="text-base leading-relaxed text-gray-700 mb-4">
                {bodyText}
              </Text>
            </Section>
            <Text className="text-xs text-gray-400 leading-4 mt-6">
              You received this because you are in scope for procedure roll-outs
              in your organization.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ProcedureRolloutEmail;
