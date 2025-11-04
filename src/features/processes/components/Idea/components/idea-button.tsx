"use client";

import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { ProcessIdeaDialog } from "./idea-dialog";
import { createIdea } from "../actions/create-idea";


export const IdeaButton = ({ teamId }: { teamId: string }) => {
    const [actionState, action] = useActionState(
        createIdea,
        EMPTY_ACTION_STATE,
    );

    return (
        <ProcessIdeaDialog
        title="Submit Idea"
        description="Submit an idea for this teams docs"
        action={action}
        actionState={actionState}
        teamId={teamId}
        />
    )
}

