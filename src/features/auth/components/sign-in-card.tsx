"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CardCompact } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { requestOtpAction } from "../actions/request-otp";
import { verifyOtpAction } from "../actions/verify-otp";
import { toast } from "sonner";
import { OtpInput } from "./otp-input";
import { onboardingPath } from "@/app/paths";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideLoaderCircle } from "lucide-react";

const SignInCard = () => {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pendingGoogle, setPendingGoogle] = useState(false);

  const continueWithGoogle = () => {
    setPendingGoogle(true);
    const cb =
    new URLSearchParams(window.location.search).get("callbackUrl") ||
    onboardingPath();
    void signIn("google", { callbackUrl: cb }).finally(() => {
      setPendingGoogle(false);
      toast.success("Redirecting to dashboard...");
    });
  };

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
        window.location.assign(onboardingPath());
        toast.success("Code verified. Redirecting to onboarding...");
        const cb =
          new URLSearchParams(window.location.search).get("callbackUrl") ||
          onboardingPath();
        toast.success("Code verified. Redirecting...");
        window.location.assign(cb);
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
          {pendingGoogle ? (
            <LucideLoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            "Continue with Google"
          )}
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
  const footer = (
    <div className="flex flex-col gap-3 justify-center items-center w-full ">
      <Input
        placeholder="robert.scott@navisdocs.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button
        variant="outline"
        className="w-full"
        onClick={requestCode}
        disabled={pending || !email}
        type="submit"
      >
        {pending ? (
          <LucideLoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          "Email me a code"
        )}
      </Button>
      {msg && <p className="text-sm text-red-500 text-center">{msg}</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px]">
      {!sent ? (
        <>
          {/* EMAIL UI FLOW */}
          <h2 className="text-xl font-bold">Navis Docs</h2>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <CardCompact
            className="flex flex-col gap-3 mt-3 w-full"
            header={header}
            content={content}
            footer={footer}
          />
        </>
      ) : (
        <>
          {/* OTP UI FLOW */}
          <Card className="flex flex-col my-auto mx-auto gap-3 mt-3 w-full">
            <CardHeader>
              <CardTitle className="text-center">Verify your email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-center items-center gap-3 w-full">
                <OtpInput code={code} setCode={setCode} />

                <Button
                  variant="default"
                  className="w-full max-w-[180px]"
                  onClick={verifyCode}
                  disabled={pending}
                >
                  {pending ? (
                    <LucideLoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  We sent a 5-digit code to {email}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export { SignInCard };
