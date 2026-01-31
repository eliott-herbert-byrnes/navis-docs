"use client";

import { ProcedureIdeaDialog } from "./idea-dialog";
import { useCreateIdea } from "../hooks/use-ideas-mutations";

export const IdeaButton = () => {
  const { createIdea, isPending } = useCreateIdea();

  return (
    <ProcedureIdeaDialog
      title="Submit Idea"
      description="Submit an idea for this teams docs"
      onSubmit={createIdea}
      isPending={isPending}
    />
  );
};
