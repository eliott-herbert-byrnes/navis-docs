import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
// import { ThemeProvider } from "@/components/theme/theme-provider";
// import { SessionProvider } from "next-auth/react";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navis Docs",
  description: "Welcome to the Navis Docs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen `}
      >
        <Providers>
          <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
            <Sidebar />
            <main className="min-h-full p-[var(--space-3)]">
              <div className="flex h-full flex-col rounded-lg border-2 p-4">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
