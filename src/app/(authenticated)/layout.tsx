import { AuthenticatedLayoutContent } from "../authenticated-layout-content";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>;
}
