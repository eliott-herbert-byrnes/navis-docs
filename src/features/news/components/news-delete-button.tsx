"use client";

import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useActionState } from "react";
import { NewsDeleteDialog } from "./news-delete-dialog";
import { deleteNewsPost } from "../actions/delete-news";

const NewsDeleteButton = ({
  newsPostId,
  departmentId,
  teamId,
}: {
  newsPostId: string;
  departmentId: string;
  teamId: string;
}) => {
  const [actionState, action] = useActionState(
    deleteNewsPost,
    EMPTY_ACTION_STATE
  );

  return (
    <NewsDeleteDialog
      title="Are you sure you want to delete this news post?"
      description="This action cannot be undone."
      action={action}
      actionState={actionState}
      newsPostId={newsPostId}
      departmentId={departmentId}
      teamId={teamId}
    />
  );
};

export { NewsDeleteButton };
