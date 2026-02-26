"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useDeleteCategory() {
  const utils = trpc.useUtils();

  const mutation = trpc.categories.deleteCategory.useMutation({
    onSuccess: () => {
      utils.categories.getCategoriesForList.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(
        error.message ??
          "Failed to delete category, try again or contact support",
      );
    },
  });

  const deleteCategory = (categoryId: string) => {
    mutation.mutate({ categoryId });
  };

  return {
    deleteCategory,
    isPending: mutation.isPending,
  };
}

export function useDeleteCategories() {
  const utils = trpc.useUtils();

  const mutation = trpc.categories.deleteCategories.useMutation({
    onSuccess: (data) => {
      utils.categories.getCategoriesForList.invalidate();
      utils.procedures.categoriesWithProcedures.invalidate();
      const count = data?.data?.deletedCount ?? 0;
      toast.success(
        count === 1 ? "Category deleted" : `${count} categories deleted`,
      );
    },
    onError: (error) => {
      toast.error(
        error.message ??
          "Failed to delete categories, try again or contact support",
      );
    },
  });

  const deleteCategories = (categoryIds: string[]) => {
    mutation.mutate({ categoryIds });
  };

  return {
    deleteCategories,
    isPending: mutation.isPending,
  };
}
