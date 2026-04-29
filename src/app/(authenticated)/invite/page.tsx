import { dashboardPath, onboardingPath } from "@/app/paths";
import { DemoNotAvailable } from "@/components/demo/not-available";
import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { PageContainer } from "@/components/ui/page-container";
import { InvitationCreateButton } from "@/features/invite/components/invitation-create-button";
import { InvitationList } from "@/features/invite/components/invitation-list";
import { InvitationSearch } from "@/features/invite/components/invitation-search";
import { getSessionContext } from "@/lib/auth";
import { isDemoContext } from "@/lib/demo";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type InvitationPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

const InvitationPage = async ({ searchParams }: InvitationPageProps) => {
  if (await isDemoContext()) {
    return <DemoNotAvailable feature="Invitations" />;
  }

  const ctx = await getSessionContext();
  const { org, isAdmin } = ctx ?? {};
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(dashboardPath());

  const params = await searchParams;
  const search = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <PageContainer>
      <Heading
        title="Invitations"
        description="Invite your team members to your organization"
        actions={<InvitationCreateButton />}
      />
      <div className="px-1 mb-4">
        <InvitationSearch />
      </div>
      <Suspense fallback={<ListSkeleton />} key={`${search}-${page}`}>
        <InvitationList orgId={org.id} search={search} page={page} />
      </Suspense>
    </PageContainer>
  );
};

export default InvitationPage;
