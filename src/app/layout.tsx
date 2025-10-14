import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
// import { ThemeProvider } from "@/components/theme/theme-provider";
// import { SessionProvider } from "next-auth/react";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { OrgBadge } from "@/features/org/components/org-bade";
import { Badge } from "@/components/ui/badge";

const GeistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navis Docs",
  description: "Welcome to the Navis Docs",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const org = await getUserOrg(user?.userId ?? "");
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased min-h-screen`}>
        <Providers>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset className="p-2">
              <div className="flex flex-row h-full">
                <div className="flex h-full w-full flex-col rounded-lg border-2 p-4">
                  {user && (
                    <>
                      <div className="flex flex-row items-center justify-between">
                        <SidebarTrigger />
                        <Badge variant="outline">
                          {org?.plan
                            ? `${org.plan.charAt(0).toUpperCase()}${org.plan.slice(1)}`
                            : "No plan"}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                    </>
                  )}
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
