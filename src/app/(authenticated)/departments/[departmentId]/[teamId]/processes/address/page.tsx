import { Heading } from "@/components/Heading";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { AddressList } from "@/features/address/components/address-list";
import { AddressCreateButton } from "@/features/address/components/address-create-button";

export default async function AddressPage() {
  const user = await getSessionUser();
  const { isAdmin } = await getUserOrgWithRole(user?.userId ?? "");

  return (
    <>
      <Heading
        title="Address Book"
        description="Manage or create a new address"
        actions={isAdmin ? <AddressCreateButton isAdmin={isAdmin} /> : null}
      />

      <AddressList isAdmin={isAdmin} />
    </>
  );
}
