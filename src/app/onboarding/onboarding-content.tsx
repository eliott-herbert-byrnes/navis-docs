import { OnboardForm } from "@/features/onboarding/components/onboard-form";
import { getSessionContext } from "@/lib/auth";
import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";
import { homePath, signInPath } from "../paths";

export async function OnboardingContent() {
  const ctx = await getSessionContext();
  if (!ctx) redirect(signInPath());
  if (ctx?.org) redirect(homePath());

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Onboarding
        </a>
        <OnboardForm />
      </div>
    </div>
  );
}
