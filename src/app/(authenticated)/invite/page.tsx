import { onboardingPath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { InvitationCreateButton } from "@/features/invite/components/invitation-create-button";
import { InvitationList } from "@/features/invite/components/invitation-list";
import { InvitationSearch } from "@/features/invite/components/invitation-search";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type InvitationPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

const InvitationPage = async ({ searchParams }: InvitationPageProps) => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(signInPath());

  const params = await searchParams;
  const search = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <>
      <Heading
        title="Invitations"
        description="Invite your team members to your organization"
        actions={<InvitationCreateButton />}
      />
      <div className="px-1 mb-4">
        <InvitationSearch />
      </div>
      <Suspense fallback={<Spinner />} key={`${search}-${page}`}>
        <InvitationList orgId={org.id} search={search} page={page} />
      </Suspense>
    </>
  );
};

export default InvitationPage;
