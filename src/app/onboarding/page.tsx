import { Suspense } from "react";
import { OnboardingContent } from "./onboarding-content";
import { getSessionContext } from "@/lib/auth";
import { homePath, signInPath } from "../paths";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function OnboardingFallback() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <p className="text-sm text-muted-foreground text-center">Loading…</p>
      </div>
    </div>
  );
}

export default async function OnboardingPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());
  if (ctx?.org) redirect(homePath());

  const pendingInvite = await prisma.invitation.findFirst({
    where: {
      email: ctx.email.toLowerCase(),
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });
  if (pendingInvite) redirect("/auth/pending-invite");
  
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingContent />
    </Suspense>
  );
}
