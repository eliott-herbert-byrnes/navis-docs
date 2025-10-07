"use client";

import { SignInCard } from "@/features/auth/components/sign-in-card";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { GalleryVerticalEnd, LucideShip } from "lucide-react";

const SignInPage = () => {
  return (
    <div className=" flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 rounded-lg">
    <div className="flex w-full max-w-sm flex-col gap-6">
      <a href="#" className="flex items-center gap-2 self-center font-medium">
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <LucideShip className="size-4" />
        </div>
        Navis Docs
      </a>
      <SignInForm />
    </div>
  </div>
  );
};

export default SignInPage;
