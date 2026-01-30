"use client";
import { homePath } from "@/app/paths";
import { Heading } from "@/components/ui/Heading";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { UserList } from "@/features/user-base/components/user-list";
import { trpc } from "@/trpc/client";
import { redirect, useSearchParams } from "next/navigation";

export default function UserBasePage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { data, isLoading, error } = trpc.users.getOrgMembers.useQuery({
    search,
    limit,
    offset,
  });

  if (error?.data?.code === "FORBIDDEN") {
    redirect(homePath());
  }

  return (
    <>
      <Heading
        title="Userbase"
        description="View and manage users for your organization"
      />
      {isLoading ? <ListSkeleton /> : <UserList data={data?.members ?? []} />}
    </>
  );
}
