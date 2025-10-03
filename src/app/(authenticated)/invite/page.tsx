import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/Heading";
import { InvitationCreateButton } from "@/features/invite/components/invitation-create-button";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { redirect } from "next/navigation";

const InvitationPage = async () => {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");
  const org = await getUserOrg(user.userId);
  if (!org) redirect("/");

    return (
        <>
        <Heading
          title="Invitations"
          description="Invite your team members to your organization"
          actions={
            <InvitationCreateButton />
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