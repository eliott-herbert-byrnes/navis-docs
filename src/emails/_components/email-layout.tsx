import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export type EmailLayoutProps = {
  preview: string;
  footerText: string;
  children: ReactNode;
};

export function EmailLayout({
  preview,
  footerText,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#8ebeca",
              },
            },
          },
        }}
      >
        <Body className="bg-gray-50 font-sans text-gray-800">
          <Container className="bg-white shadow-sm rounded-lg my-10 mx-auto p-8 max-w-[560px] mb-16">
            <div className="flex flex-row items-center gap-2 mb-6">
              <Text className="font-serif text-3xl m-0">Navis Docs</Text>
            </div>
            {children}
            <hr className="border border-gray-200 my-5" />
            <Text className="text-xs text-gray-400 leading-4 mt-6">
              {footerText}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
