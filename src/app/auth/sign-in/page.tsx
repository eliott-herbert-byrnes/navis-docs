"use client";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import Image from "next/image";

const SignInPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 rounded-lg">
      <div className="flex w-full max-w-sm flex-col gap-6">
          <a className="flex items-center gap-6 self-center font-medium font-serif text-8xl">
            <div className="flex items-center justify-center">
              <Image src="\navis-docs-logo-square.svg" alt="" width="90" height="90" className="rounded-md shrink-0" />
            </div>
            Navis.docs
          </a>
        <SignInForm />
      </div>
    </div>
  );
};

export default SignInPage;
