"use client";

import { PageContainer } from "@/components/ui/page-container";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import Image from "next/image";

const SignInPage = () => {
  return (
    <PageContainer>
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium font-serif text-4xl">
          <div className="flex size-10 items-center justify-center rounded-md text-primary-foreground">
            <Image src="/nd-square-blue-png.png" width={80} height={80} alt="Navis Docs logo" />
          </div>
          Navis Docs
        </div>
        <SignInForm />
      </div>
    </div>
    </PageContainer>
  );
};

export default SignInPage;
