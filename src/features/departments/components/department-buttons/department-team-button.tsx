"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { DepartmentTeamDialog } from "./department-team-dialog";
import { addTeam } from "../../actions/add-team";


const DepartmentTeamButton = ({ departmentId, isAdmin }: { departmentId: string, isAdmin: boolean }) => {
    const [actionState, action] = useActionState(       
        addTeam,
        EMPTY_ACTION_STATE,
    );

    return (
        <DepartmentTeamDialog 
        title="Add Team"
        description="Add a new team to the department"
        action={action}
        actionState={actionState}
        disabled={!isAdmin}
        departmentId={departmentId}
        />
    );
};

export { DepartmentTeamButton };