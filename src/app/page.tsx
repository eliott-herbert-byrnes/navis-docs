
import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { onboardingPath, signInPath } from "./paths";
import { DepartmentList } from "@/features/departments/components/department-list";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());
  
  const org = await getUserOrg(user.userId);
  if (!org) redirect(onboardingPath());

  return (
    <>
      <Heading
        title="Departments"
        description="Manage your departments"
        actions={
            <Button variant="outline">
            <PlusIcon className="w-4 h-4" />
              Department
          </Button>
        }
      />

      <DepartmentList orgId={org.id} />
    </>
  );
}
