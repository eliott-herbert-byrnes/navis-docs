import { Providers } from "@/app/providers";

export default function AcceptInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
