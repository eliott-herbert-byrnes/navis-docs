import { AuthenticatedLayoutContent } from "../authenticated-layout-content";
import { Providers } from "../providers";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthenticatedLayoutContent>
        {children}
      </AuthenticatedLayoutContent>
    </Providers>
  )
}
