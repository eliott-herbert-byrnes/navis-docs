import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { redirect } from "next/navigation";

const OnboardingPage = async () => {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  const ExistingOrg = await getUserOrg(user.userId);
  if (ExistingOrg) redirect("/");

  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px]">
      <OnboardingForm />
    </div>
  );
};

export default OnboardingPage;
