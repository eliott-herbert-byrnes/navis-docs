"use client";

import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { viewProcessPath } from "@/app/paths";
import { ProcessFavoriteButton } from "./process-favorite-button";
import { FileText, Folder } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProcessRouteContext } from "@/contexts/process-route-context";

export function FavoriteList() {
  const { departmentId, teamId } = useProcessRouteContext();
  const { data, isLoading, error } = trpc.favorites.getFavorites.useQuery({
    teamId,
  });

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
        body={error.message || "Failed to load your favorite processes"}
      />
    );
  }

  const favorites = data?.data ?? [];

  if (!favorites.length) {
    return (
      <EmptyState
        title="No favorites found"
        body="Add a process to your favorites to get started"
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {favorites.map((process) => (
        <Card
          key={process.id}
          className="hover:scale-101 transition-all duration-300 flex flex-col h-full w-full md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/6 animate-fade-from-top"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 min-h-[3rem]">
              <Link
                href={viewProcessPath(departmentId, teamId, process.id)}
                className="flex-1"
              >
                <CardTitle className="text-base hover:text-primary transition-colors line-clamp-2">
                  {process.title}
                </CardTitle>
              </Link>
              <ProcessFavoriteButton
                processId={process.id}
                initialIsFavorite={true}
                size="sm"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {process.category && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Folder className="w-3 h-3" />
                  {process.category.name}
                </div>
              )}
              {process.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {process.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span className="capitalize">{process.style.toLowerCase()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
