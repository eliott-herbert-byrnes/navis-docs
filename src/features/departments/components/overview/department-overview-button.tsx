"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { DepartmentOverview } from "./department-overview";
import { overviewDepartment } from "../../actions/overview-department";

type DepartmentOverviewButtonProps = {
    departmentId: string;
    title: string;
    isAdmin: boolean;
};

const DepartmentOverviewButton = ({ departmentId, title, isAdmin }: DepartmentOverviewButtonProps) => {
    const [actionState, action] = useActionState(       
        overviewDepartment,
        EMPTY_ACTION_STATE,
    );

    return (
        <DepartmentOverview 
        title={title}
        action={action}
        actionState={actionState}
        disabled={!isAdmin}
        departmentId={departmentId}
        isAdmin={isAdmin}
        />
    );
};

export { DepartmentOverviewButton };