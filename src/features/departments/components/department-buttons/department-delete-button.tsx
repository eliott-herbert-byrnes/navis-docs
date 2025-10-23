"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { deleteDepartment } from "../../actions/delete-department";
import { DepartmentDeleteDialog } from "./department-delete-dialog";


const DepartmentDeleteButton = ({ departmentId, isAdmin }: { departmentId: string, isAdmin: boolean }) => {
    const [actionState, action] = useActionState(       
        deleteDepartment,
        EMPTY_ACTION_STATE,
    );

    return (
        <DepartmentDeleteDialog 
        title="Are you sure you want to delete this department?"
        description="This action cannot be undone."
        action={action}
        actionState={actionState}
        disabled={!isAdmin}
        departmentId={departmentId}
        />
    );
};

export { DepartmentDeleteButton };