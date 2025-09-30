"use client";

import { SignInCard } from "@/features/auth/components/sign-in-card";

const SignInPage = () => {
  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px]">
      <SignInCard />
    </div>
  );
};

export default SignInPage;
