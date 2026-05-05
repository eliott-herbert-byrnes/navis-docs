import { Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/_components/email-layout";

export type ProcedureRolloutEmailProps = {
  procedureTitle: string;
  categoryName?: string | null;
  departmentName?: string | null;
  teamName?: string | null;
};

export function ProcedureRolloutEmail({
  procedureTitle,
  categoryName,
  departmentName,
  teamName,
}: ProcedureRolloutEmailProps) {
  const contextParts = [teamName, departmentName, categoryName].filter(
    (s): s is string => !!s,
  );
  const contextLine =
    contextParts.length > 0 ? `(${contextParts.join(" · ")})` : null;

  return (
    <EmailLayout
      preview={`New procedure: ${procedureTitle}`}
      footerText="You received this because you are in scope for procedure roll-outs in your organization."
    >
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
          A new or updated procedure has been published and is available for you
          to read. Please review it and mark as read.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default ProcedureRolloutEmail;
