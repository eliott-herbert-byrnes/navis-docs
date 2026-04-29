import { Providers } from "../providers";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}