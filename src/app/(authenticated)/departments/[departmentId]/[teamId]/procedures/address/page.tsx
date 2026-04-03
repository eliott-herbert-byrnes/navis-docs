import { Heading } from "@/components/ui/Heading";
import { getSessionContext } from "@/lib/auth";
import { AddressList } from "@/features/address/components/address-list";
import { AddressCreateButton } from "@/features/address/components/address-create-button";

export default async function AddressPage() {
  const ctx = await getSessionContext();
  const { isAdmin } = ctx ?? {};

  return (
    <>
      <Heading
        title="Address Book"
        description="Manage or create a new address"
        actions={isAdmin ? <AddressCreateButton /> : null}
      />

      <AddressList />
    </>
  );
}
