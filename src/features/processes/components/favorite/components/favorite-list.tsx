import { EmptyState } from "@/components/empty-state";
import { getFavorites } from "../queries/get-favorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { viewProcessPath } from "@/app/paths";
import { ProcessFavoriteButton } from "./process-favorite-button";
import { FileText, Folder } from "lucide-react";

type FavoriteListProps = {
  departmentId: string;
  teamId: string;
};

export async function FavoriteList({
  departmentId,
  teamId,
}: FavoriteListProps) {
  const favorites = await getFavorites(teamId);

  if (!favorites.length) {
    return (
      <EmptyState
        title="No favorites found"
        body="Add a process to your favorites to get started"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((process) => (
        <Card
          key={process.id}
          className="hover:border-primary transition-colors"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={viewProcessPath(departmentId, teamId, process.id)}
                className="flex-1"
              >
                <CardTitle className="text-base hover:text-primary transition-colors">
                  {process.title}
                </CardTitle>
              </Link>
              <ProcessFavoriteButton
                processId={process.id}
                initialIsFavorite={true}
                size="icon"
              />
            </div>
          </CardHeader>
          <CardContent>
            {process.category && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Folder className="w-3 h-3" />
                {process.category.name}
              </div>
            )}
            {process.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {process.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span className="capitalize">{process.style.toLowerCase()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
