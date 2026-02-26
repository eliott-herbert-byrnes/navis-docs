import { homePath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { ExportUserOrgDataButton } from "@/features/settings/components/export-user-org-data-button";
import { UserList } from "@/features/user-base/components/user-list";
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

export default async function UserBasePage({ searchParams }: UserBasePageProps) {
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
      redirect(homePath());
    }
    throw err;
  }

  return (
    <>
      <Heading
        title="Userbase"
        description="View and manage users for your organization"
        actions={<ExportUserOrgDataButton />}
      />
      <Suspense fallback={<ListSkeleton />} key={`${search ?? ""}-${page}`}>
        <UserList data={members} />
      </Suspense>
    </>
  );
}
