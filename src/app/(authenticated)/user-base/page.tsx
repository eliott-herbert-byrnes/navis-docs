import { homePath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Spinner } from "@/components/ui/spinner";
import { UserList } from "@/features/user-base/components/user-list";
import { getOrgMembers, getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type UserBasePageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

const UserBasePage = async ({ searchParams }: UserBasePageProps) => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(homePath());

  const params = await searchParams;
  const search = params.search;

  const members = await getOrgMembers(org.id, search);

  return (
    <>
      <Heading
        title="UserBase"
        description="View and manage users for your organization"
      />
      <Suspense fallback={<Spinner />} key={search}>
        <UserList data={members} />
      </Suspense>
    </>
  );
};

export default UserBasePage;
