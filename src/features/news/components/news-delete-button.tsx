"use client";

import { NewsDeleteDialog } from "./news-delete-dialog";
import { useDeleteNews } from "../hook/use-news-mutations";

const NewsDeleteButton = ({
  newsPostId,
}: {
  newsPostId: string;
}) => {
  const { deleteNews, isPending } = useDeleteNews();

  const handleDelete = () => {
    deleteNews(newsPostId)
  }

  return (
    <NewsDeleteDialog
      title="Are you sure you want to delete this news post?"
      description="This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
};

export { NewsDeleteButton };
