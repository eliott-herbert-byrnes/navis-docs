import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { getStripeCustomerByOrg } from "@/features/stripe/queries/get-stripe-customer";
import { stripe } from "@/lib/stripe"; // ADD

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
  const isAdmin = await isOrgAdminOrOwner(user?.userId ?? "");
  const org = await getUserOrg(user?.userId ?? "");
  const stripeCustomer = await getStripeCustomerByOrg(org?.slug ?? "");

  let subscriptionStatus = stripeCustomer?.stripeSubscriptionStatus ?? null;
  if (stripeCustomer?.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(
        stripeCustomer.stripeSubscriptionId
      );
      subscriptionStatus = sub.status;
    } catch {}
  }

  const activeSubscription = subscriptionStatus === "active";
  const activePlan = stripeCustomer?.plan ?? "";
  const planLabel =
    activeSubscription && activePlan
      ? `${activePlan.charAt(0).toUpperCase()}${activePlan.slice(1)}`
      : "No plan";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased min-h-screen`}>
        <Providers>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset className="p-2">
              <div className="flex flex-row h-full">
                <div className="flex h-full w-full flex-col rounded-lg  p-4">
                  {user && (
                    <>
                      <div className="flex flex-row items-center justify-between">
                        <SidebarTrigger />
                        {isAdmin && (
                          <Badge variant="outline">{planLabel}</Badge>
                        )}
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
