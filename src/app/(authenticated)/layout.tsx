import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { AuthenticatedLayoutContent } from "../authenticated-layout-content";
import { Providers } from "../providers";
import { signInPath } from "../paths";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());

  return (
    <Providers>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </Providers>
  );
}
