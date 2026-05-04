"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { viewProcedurePath } from "@/app/paths";
import { Folder, Star } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";

export function FavoriteList() {
  const { departmentId, teamId } = useProcedureRouteContext();
  const { data, isLoading, error } = trpc.favorites.getFavorites.useQuery(
    { teamId },
    { staleTime: 1000 * 60 },
  );

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="flex flex-col h-full w-full md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/6"
          >
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading favorites"
        body={error.message || "Failed to load your favorite procedures"}
      />
    );
  }

  const favorites = data?.data ?? [];

  if (!favorites.length) {
    return (
      <EmptyState
        title="No favorites found"
        body="Add a procedure to your favorites to get started"
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-4 mb-8 sm:mb-0">
      {favorites.map((procedure) => (
        <Card
            key={procedure.id}
            className="flex flex-col h-full w-full md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/6 animate-fade-from-top shadow-none border hover:shadow"
          >
        <Link
          href={viewProcedurePath(departmentId, teamId, procedure.id)}
          className="flex-1"
        >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 min-h-[3rem]">
                <CardTitle className="text-base light:hover:text-black/65 dark:hover:text-white/75 transition-colors line-clamp-2">
                  {procedure.title}
                </CardTitle>
                <Star
                  className={`w-5 h-5 fill-brand text-brand`}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {procedure.category && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Folder className="w-3 h-3" />
                    {procedure.category.name}
                  </div>
                )}
                {procedure.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {procedure.description}
                  </p>
                )}
              </div>
            </CardContent>
        </Link>
          </Card>
      ))}
    </div>
  );
}
