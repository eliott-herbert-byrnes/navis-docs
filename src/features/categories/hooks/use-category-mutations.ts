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
      toast.error(error.message ?? "Failed to delete category, try again or contact support");
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
