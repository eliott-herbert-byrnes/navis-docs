"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth-card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

// TODO: add OTP and check if it is working
import { requestOtpAction } from "../actions/request-otp";
import { verifyOtpAction } from "../actions/verify-otp";
import { toast } from "sonner";

const SignInCard = () => {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const continueWithGoogle = () => {
    signIn("google", { callbackUrl: "/onboarding" });
  };

  // TODO: add OTP and check if it is working
  const requestCode = () => {
    startTransition(async () => {
      const res = await requestOtpAction(email);
      setMsg(res.message);
      if (res.ok) {
        setSent(true);
        toast.success("Code sent. Check your email");
      } else {
        toast.error(res.message ?? "Invalid email");
      }
    });
  };

  const verifyCode = () => {
    startTransition(async () => {
      const res = await verifyOtpAction({ email, code });
      if (res.ok) {
        window.location.assign("/onboarding");
        toast.success("Code verified. Redirecting to onboarding...");
      } else {
        setMsg(res.message ?? null);
        toast.error(res.message ?? "Invalid code");
      }
    });
  };

  const header = (
    <>
      <Button onClick={continueWithGoogle} disabled={pending}>
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
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </>
  );

  // TODO: add manual input for email address and check if it is working
  const footer = (
    <div className="flex flex-col gap-3 justify-center items-center w-full ">
      <Input
        placeholder="robert.scott@navisdocs.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* // TODO: add RequestCode and check if it is working */}
      <Button variant="outline" className="w-full" onClick={requestCode} disabled={pending || !email}>
        Email me a code
      </Button>
      {msg && (
        <p className="text-sm text-red-500 text-center">
          {msg}
        </p>
      )}
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
          <p className="text-sm text-muted-foreground text-center">
            We sent a 5-digit code to {email}
          </p>
          <InputOTP
            value={code}
            onChange={(e) => setCode(e)}
            maxLength={5}
            pattern={REGEXP_ONLY_DIGITS}
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
            // TODO: check if code is working
            onClick={verifyCode}
            disabled={pending}
          >
            Verify & Continue
          </Button>
        </>
      )}
    </div>
  );
};

export { SignInCard };
