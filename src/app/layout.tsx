import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { AuthProvider } from "@/contexts/auth-context";
import { MainHeaderBreadcrumbs } from "@/features/breadcrumbs/components/main-header-breadcrumbs";
import { OrgBadge } from "@/features/org/components/org-badge";

const GeistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navis Docs",
  description: "Welcome to the Navis Docs",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${GeistSans.variable} antialiased min-h-screen`}>
          <Providers>{children}</Providers>
          <Toaster />
        </body>
      </html>
    );
  }

  const { org, isAdmin } = await getUserOrgWithRole(user.userId);

  if (!org) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${GeistSans.variable} antialiased min-h-screen`}>
          <Providers>{children}</Providers>
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased min-h-screen`}>
        <Providers>
          <AuthProvider isAdmin={isAdmin} userId={user.userId}>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarInset className="p-2">
                <div className="flex flex-row h-full">
                  <div className="flex h-full w-full flex-col rounded-sm pl-4 pr-4 pt-2">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center gap-2">
                        <div className="sm:hidden">
                          <SidebarTrigger />
                        </div>
                        <div className="hidden md:inline">
                        <MainHeaderBreadcrumbs />
                        </div>
                      </div>
                      <OrgBadge />
                    </div>
                    <Separator className="mt-2" />
                    {children}
                  </div>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </AuthProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
