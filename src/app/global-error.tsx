"use client";

import "./globals.css";
import { Geist } from "next/font/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GeistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} antialiased min-h-screen`}>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex items-center gap-2 self-center font-medium font-serif text-4xl">
              <div className="flex size-10 items-center justify-center rounded-md text-primary-foreground">
                <img
                  src="/nd-square-blue-png.png"
                  width={80}
                  height={80}
                  alt="Navis Docs logo"
                />
              </div>
              Navis Docs
            </div>
            <Card className="animate-fade-from-top border-none">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Something went wrong</CardTitle>
                <CardDescription>
                  An unexpected error occurred. Please try again.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  className="w-full bg-brand hover:bg-brand/75"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </body>
    </html>
  );
}
