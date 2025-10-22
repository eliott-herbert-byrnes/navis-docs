"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { useEffect } from "react";
import { TeamRenameDialog } from "./team-rename-dialog";
import { renameTeam } from "../../actions/rename-team";

const TeamRenameButton = ({ 
  departmentId, 
  teamName,
  onSuccess 
}: { 
  departmentId: string;
  teamName: string;
  onSuccess?: () => void;
}) => {
    const [actionState, action] = useActionState(       
        renameTeam,
        EMPTY_ACTION_STATE,
    );

    useEffect(() => {
      if (actionState.status === "SUCCESS" && onSuccess) {
        onSuccess();
      }
    }, [actionState.status, onSuccess]);

    return (
        <TeamRenameDialog 
        title="Are you sure you want to rename this team?"
        description="This action will rename the team and all associated documents will be updated."
        action={action}
        actionState={actionState}
        departmentId={departmentId}
        teamName={teamName}
        />
    );
};

export { TeamRenameButton };