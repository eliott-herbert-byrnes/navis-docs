import { dashboardPath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { PageContainer } from "@/components/ui/page-container";
import { ExportUserOrgDataButton } from "@/features/settings/components/export-user-org-data-button";
import { UserList } from "@/features/user-base/components/user-list";
import { getSessionContext } from "@/lib/auth";
import { serverTrpc } from "@/server/trpc/server";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type UserBasePageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function UserBasePage({
  searchParams,
}: UserBasePageProps) {
  const ctx = await getSessionContext();
  const { isAdmin } = ctx ?? {};
  if (!isAdmin) redirect(dashboardPath());
  const params = await searchParams;
  const search = params.search;
  const page = parseInt(params.page ?? "1", 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const trpc = await serverTrpc();
  let members: Awaited<ReturnType<typeof trpc.users.getOrgMembers>>["members"];
  
  try {
    const data = await trpc.users.getOrgMembers({ search, limit, offset });
    members = data.members ?? [];
  } catch (err) {
    if (err instanceof TRPCError && err.code === "FORBIDDEN") {
      redirect(dashboardPath());
    }
    throw err;
  }

  return (
    <PageContainer>
      <Heading
        title="Userbase"
        description="View and manage users for your organization"
        actions={<ExportUserOrgDataButton />}
      />
      <Suspense fallback={<ListSkeleton />} key={`${search ?? ""}-${page}`}>
        <UserList data={members} />
      </Suspense>
    </PageContainer>
  );
}
