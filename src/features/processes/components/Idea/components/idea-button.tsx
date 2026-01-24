"use client";

import { ProcessIdeaDialog } from "./idea-dialog";
import { useCreateIdea } from "../hooks/use-ideas-mutations";

export const IdeaButton = () => {
  const { createIdea, isPending } = useCreateIdea();

  return (
    <ProcessIdeaDialog
      title="Submit Idea"
      description="Submit an idea for this teams docs"
      onSubmit={createIdea}
      isPending={isPending}
    />
  );
};
