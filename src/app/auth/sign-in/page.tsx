"use client";

import { PageContainer } from "@/components/ui/page-container";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import Image from "next/image";

const SignInPage = () => {
  return (
    <PageContainer>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 rounded-lg bg-brand">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a className="flex items-center gap-6 self-center font-medium font-serif text-8xl text-black">
            <div className="flex items-center justify-center">
              <Image src="/nd-square-black-png.png" alt="" width="90" height="90" className="rounded-xs shrink-0" />
            </div>
            Navis.docs
          </a>
          <SignInForm />
        </div>
      </div>
    </PageContainer>
  );
};

export default SignInPage;
