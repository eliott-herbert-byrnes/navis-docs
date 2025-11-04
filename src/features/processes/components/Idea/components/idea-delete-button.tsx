"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { deleteIdea } from "../actions/delete-idea";
import { IdeaDeleteDialog } from "./idea-delete-dialog";

const IdeaDeleteButton = ({ ideaId }: { ideaId: string }) => {
    const [actionState, action] = useActionState(       
        deleteIdea,
        EMPTY_ACTION_STATE,
    );

    return (
        <IdeaDeleteDialog 
        title="Are you sure you want to delete this idea?"
        description="This action cannot be undone."
        action={action}
        actionState={actionState}
        ideaId={ideaId}
        />
    );
};

export { IdeaDeleteButton };