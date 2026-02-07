"use client";

import { Heading } from "@/components/ui/Heading";
import { CategoriesList } from "@/features/categories/components/categories-list";
import { trpc } from "@/trpc/client";
import { ListSkeleton } from "@/components/ui/list-skeleton";

const CategoriesPage = () => {
  const { data, isLoading } = trpc.categories.getCategoriesForList.useQuery({
    search: "",
    limit: 10,
    offset: 0,
  });

  return (
    <>
      <Heading
        title="Categories"
        description="View and manage categories for your organization"
      />

      {isLoading ? (
        <ListSkeleton />
      ) : (
        <CategoriesList data={data?.categories ?? []} />
      )}
    </>
  );
};

export default CategoriesPage;
