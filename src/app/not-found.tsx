import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { homePath } from "@/app/paths";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Navis Docs",
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium font-serif text-4xl">
          <div className="flex size-10 items-center justify-center rounded-md text-primary-foreground">
            <Image
              src="/nd-square-blue-png.png"
              width={80}
              height={80}
              alt="Navis Docs logo"
            />
          </div>
          Navis.docs
        </div>
        <Card className="animate-fade-from-top border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">404 - Page Not Found</CardTitle>
            <CardDescription>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="w-full bg-brand hover:bg-brand/75">
              <Link href={homePath()}>Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
