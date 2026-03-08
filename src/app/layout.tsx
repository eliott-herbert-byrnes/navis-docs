import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { AuthenticatedLayoutWithSuspense } from "./authenticated-layout-content";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased min-h-screen`}>
        <Providers>
          <Toaster />
          <AuthenticatedLayoutWithSuspense>{children}</AuthenticatedLayoutWithSuspense>
        </Providers>
      </body>
    </html>
  );
}
