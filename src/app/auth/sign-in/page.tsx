"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignIn() {
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

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {!sent ? (
        <>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <Button onClick={requestCode}>Email me a code</Button>
          <div className="text-center text-sm">or</div>
          <Button variant="outline" onClick={()=>signIn("google", { callbackUrl: "/onboarding" })}>Sign in with Google</Button>
        </>
      ) : (
        <>
          <p>We sent a 5-digit code to {email}</p>
          <input className="border rounded px-3 py-2 w-full" placeholder="12345" value={code} onChange={e=>setCode(e.target.value)} />
          <Button onClick={verifyCode}>Verify & Continue</Button>
        </>
      )}
    </div>
  );
}