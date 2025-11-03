"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, FolderOpen } from "lucide-react";
import { ProcessForViewWithRelations } from "../types/types";

type ProcessViewMetadataProps = {
  process: ProcessForViewWithRelations;
};

export function ProcessViewMetadata({ process }: ProcessViewMetadataProps) {
  const publishedVersion = process.publishedVersion;

  if (!publishedVersion) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap gap-4 text-sm items-center">
        {/* Published Date */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Published {formatDate(publishedVersion.createdAt)}</span>
        </div>

        {/* Team/Category Badges */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {process.category && (
            <Badge variant="secondary">
              <FolderOpen className="w-3 h-3 mr-1" />
              {process.category.name}
            </Badge>
          )}
          {process.team && <Badge variant="outline">{process.team.name}</Badge>}
          <Badge variant="outline" className="capitalize">
            {process.style.toLowerCase()}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
