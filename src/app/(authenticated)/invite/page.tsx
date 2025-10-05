import { homePath, signInPath } from "@/app/paths";
import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/Heading";
import { InvitationCreateButton } from "@/features/invite/components/invitation-create-button";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { redirect } from "next/navigation";

const InvitationPage = async () => {


  const user = await getSessionUser();
  if (!user) redirect(signInPath());2

  const isAdmin = await isOrgAdminOrOwner(user.userId);
  if (!isAdmin) redirect(homePath());

  const org = await getUserOrg(user.userId);
  if (!org) redirect(homePath());

    return (
        <>
        <Heading
          title="Invitations"
          description="Invite your team members to your organization"
          actions={<InvitationCreateButton />
          }
          />
    
        <EmptyState
          title="No invitations found"
          body="Invite your team members to your organization"
          />
      </>
    );
}

export default InvitationPage;