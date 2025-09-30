"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth-card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

const SignInCard = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  async function requestCode() {
    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "content-type": "application/json" },
    });
    if (res.ok) setSent(true);
  }

  async function verifyCode() {
    const res = await signIn("credentials", {
      email,
      code,
      redirect: true,
      callbackUrl: "/onboarding",
    });
    // next-auth handles redirect
  }

  const header = (
    <>
      <Button onClick={() => signIn("google", { callbackUrl: "/onboarding" })}>
        <div className="flex justify-center items-center ">
          <span className="mr-2">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 488 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
          </span>
          Continue with Google
        </div>
      </Button>
    </>
  );

  const content = (
    <>
      <div className="flex flex-row gap-3 items-center justify-center mx-auto max-w-[130px]">
        <Separator />
        <span className="text-sm text-muted-foreground">or</span>
        <Separator />
      </div>
    </>
  );

  // TODO: add manual input for email address
  const footer = (
    <div className="flex flex-col gap-3 justify-center items-center w-full ">
      <Input
        placeholder="robert.scott@navis-docs.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button variant="outline" className="w-full" onClick={requestCode}>
        Email me a code
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px]">
      {!sent ? (
        <>
          <h2 className="text-xl font-bold">Navis Docs</h2>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <AuthCard
            className="flex flex-col gap-3 mt-3 w-full"
            header={header}
            content={content}
            footer={footer}
          />
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="" className="underline">
              Sign up
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            We sent a 5-digit code to {email}
          </p>
          <InputOTP
            value={code}
            onChange={(e) => setCode(e)}
            maxLength={5}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            variant="outline"
            className="w-full max-w-[250px] mt-1"
            onClick={verifyCode}
          >
            Verify & Continue
          </Button>
        </>
      )}
    </div>
  );
};

export { SignInCard };
