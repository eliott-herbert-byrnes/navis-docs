import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { ProcessBreadcrumbs } from "../_navigation";
import { getAddresses } from "@/features/address/queries/get-addresses";
import { AddressList } from "@/features/address/components/address-list";
import { AddressCreateButton } from "@/features/address/components/address-create-button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverTrpc } from "@/server/trpc/server";

export default async function AddressPage({
  params,
}: {
  params: Promise<{ departmentId: string; teamId: string }>;
}) {
  const { departmentId, teamId } = await params;

  const user = await getSessionUser();
  const { isAdmin } = await getUserOrgWithRole(user?.userId ?? "");

  const trpc = await serverTrpc();
  const { list: departments } = await trpc.department.list();

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
      <Suspense fallback={<Skeleton />}>
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
