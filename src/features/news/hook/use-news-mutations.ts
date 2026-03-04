"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useNewsCreate(onSuccessCallback?: () => void) {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.news.createNews.useMutation({
    onSuccess: () => {
      utils.news.getNews.invalidate();
      utils.news.getUnreadNewsCountForCurrentUser.invalidate();
      toast.success("News post successfully created");
      onSuccessCallback?.();
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to create news, try again or contact support",
      );
    },
  });

  const createNews = (data: {
    teamId: string;
    newsPostTitle: string;
    newsPostBody: string;
    pinned: boolean;
  }) => {
    mutation.mutate({
      ...data,
    });
  };

  return {
    createNews,
    isPending: mutation.isPending,
  };
}

export function useDeleteNews() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.news.deleteNews.useMutation({
    onSuccess: () => {
      utils.news.getNews.invalidate();
      utils.news.getUnreadNewsCountForCurrentUser.invalidate();
      toast.success("News post successfully deleted");

      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to delete news, try again or contact support",
      );
    },
  });

  const deleteNews = (newsPostId: string) => {
    mutation.mutate({
      newsPostId,
    });
  };

  return {
    deleteNews,
    isPending: mutation.isPending,
  };
}
