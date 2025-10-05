"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { InvitationDialog } from "./invitation-dialog";
import { createInvitation } from "../actions/create-invite";

const InvitationCreateButton = () => {
    const [actionState, action] = useActionState(       
        createInvitation,
        EMPTY_ACTION_STATE,
    );

    return (
        <InvitationDialog 
        title="Invite Team Member"
        description="Invite a team member to your organization"
        action={action}
        actionState={actionState}
        />
    )
}

export { InvitationCreateButton };