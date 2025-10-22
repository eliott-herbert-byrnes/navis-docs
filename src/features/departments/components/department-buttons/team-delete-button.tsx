"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { TeamDeleteDialog } from "./team-delete-dialog";
import { deleteTeam } from "../../actions/delete-team";
import { useEffect } from "react";

const TeamDeleteButton = ({ 
  departmentId, 
  teamName,
  onSuccess 
}: { 
  departmentId: string;
  teamName: string;
  onSuccess?: () => void;
}) => {
    const [actionState, action] = useActionState(       
        deleteTeam,
        EMPTY_ACTION_STATE,
    );

    useEffect(() => {
      if (actionState.status === "SUCCESS" && onSuccess) {
        onSuccess();
      }
    }, [actionState.status, onSuccess]);

    return (
        <TeamDeleteDialog 
        title="Are you sure you want to delete this team?"
        description="This action cannot be undone."
        action={action}
        actionState={actionState}
        departmentId={departmentId}
        teamName={teamName}
        />
    );
};

export { TeamDeleteButton };