"use client";

import { IdeaDeleteDialog } from "./idea-delete-dialog";
import { useDeleteIdea } from "../hooks/use-ideas-mutations";

const IdeaDeleteButton = ({ ideaId }: { ideaId: string }) => {
  const { deleteIdea, isPending } = useDeleteIdea();

  return (
    <IdeaDeleteDialog
      title="Are you sure you want to delete this idea?"
      description="This action cannot be undone."
      onConfirm={() => deleteIdea(ideaId)}
      isPending={isPending}
    />
  );
};

export { IdeaDeleteButton };
