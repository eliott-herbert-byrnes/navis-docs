import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { onboardingPath } from "@/app/paths";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { requestOtpAction } from "../actions/request-otp";
import { verifyOtpAction } from "../actions/verify-otp";
import { LucideLoaderCircle } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
        window.location.assign(cb);
      } else {
        setMsg(res.message ?? null);
        toast.error(res.message ?? "Invalid code");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!sent && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Login with your Google account</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <FieldGroup>
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={continueWithGoogle}
                    disabled={pendingGoogle}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    {pendingGoogle ? (
                      <LucideLoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      "Continue with Google"
                    )}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with email
                </FieldSeparator>
                <Field>
                  <Input
                    id="email"
                    type="email"
                    placeholder="captain.scott@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={requestCode}
                    disabled={pending || !email}
                    type="submit"
                  >
                    {pending ? (
                      <LucideLoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <FieldDescription className="text-black font-medium text-center">
                        Email me a code
                      </FieldDescription>
                    )}
                  </Button>
                  {msg && (
                    <FieldDescription className="text-center">
                      {msg}
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}
      {sent && (
        <>
          <Card {...props}>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Enter verification code</CardTitle>
              <CardDescription>
                We sent a 6-digit code to your email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="otp" className="sr-only">
                      Verification code
                    </FieldLabel>
                    <InputOTP
                      value={code}
                      onChange={(e) => setCode(e)}
                      maxLength={5}
                      pattern={REGEXP_ONLY_DIGITS}
                      id="otp"
                      required
                      containerClassName="w-full justify-center"
                    >
                      <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldDescription className="text-center">
                      Enter the 6-digit code sent to your email.
                    </FieldDescription>
                  </Field>
                  <Button type="submit" onClick={verifyCode} disabled={pending}>
                    {pending ? (
                      <LucideLoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                  <FieldDescription className="text-center">
                    Didn&apos;t receive the code? <a href="#" onClick={requestCode}>Resend</a>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </>
      )}
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
