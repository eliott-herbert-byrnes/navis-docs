"use client";

import { useDeleteCategory } from "../hooks/use-category-mutations";
import { CategoryDeleteDialog } from "./category-delete-dialog";

type CategoryForDelete = {
  id: string;
  name: string;
};

export function CategoryDeleteButton({
  category,
}: {
  category: CategoryForDelete;
}) {
  const { deleteCategory, isPending } = useDeleteCategory();

  const handleDelete = () => {
    deleteCategory(category.id);
  };

  return (
    <CategoryDeleteDialog
      title="Are you sure you want to delete this category?"
      description="Procedures in this category will become uncategorized. This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
    />
  );
}
