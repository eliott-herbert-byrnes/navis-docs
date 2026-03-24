import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { AuthenticatedLayoutContent } from "./authenticated-layout-content";

const GeistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navis Docs",
  description: "Welcome to the Navis Docs",
  icons: {
    icon: "/navis-docs-logo-svg.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""></link>
        <link href="https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&display=swap" rel="stylesheet"></link>
      </head>
      <body className={`${GeistSans.variable} antialiased min-h-screen`}>
        <Providers>
          <Toaster />
          <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
        </Providers>
      </body>
    </html>
  );
}
