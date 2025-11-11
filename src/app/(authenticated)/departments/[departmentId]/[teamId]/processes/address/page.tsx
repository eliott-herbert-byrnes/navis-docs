import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import { signInPath, teamProcessPath } from "@/app/paths";
import { ProcessBreadcrumbs } from "../_navigation";
import { getAddresses } from "@/features/address/queries/get-addresses";
import { AddressList } from "@/features/address/components/address-list";
import { AddressCreateButton } from "@/features/address/components/address-create-button";
import { getCachedDepartments } from "@/lib/cache-queries";

export default async function AddressPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  if (!user) redirect(signInPath());
  const { org, isAdmin } = await getUserOrgWithRole(user.userId);
  if (!org) redirect(teamProcessPath(departmentId, teamId));

  const { list: departments } = await getCachedDepartments(org.id);

  const departmentName = departments.find(
    (department) => department.id === departmentId
  )?.name;

  const teamName = departments
    .find((department) => department.id === departmentId)
    ?.teams.find((team) => team.id === teamId)?.name;

  const addresses = await getAddresses();

  return (
    <>
      <Heading
        title="Addresses"
        actions={isAdmin ? <AddressCreateButton /> : null}
        breadcrumbs={
          <ProcessBreadcrumbs
            teamName={teamName}
            departmentName={departmentName}
          />
        }
      />
      <Suspense fallback={<Spinner />}>
        {addresses.length > 0 ? (
          <AddressList data={addresses} />
        ) : (
          <EmptyState
            title="No addresses yet"
            body="Create an address to get started"
          />
        )}
      </Suspense>
    </>

  );
}
