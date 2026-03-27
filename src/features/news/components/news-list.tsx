"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PinIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";
import { NewsDeleteButton } from "./news-delete-button";
import { trpc } from "@/trpc/client";
import { useMarkNewsRead } from "../hook/use-news-mutations";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/auth-context";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { JsonObject } from "@prisma/client/runtime/client";
import type { AppRouter } from "@/server/trpc/routers/_app";
import type { inferProcedureOutput } from "@trpc/server";

type GetNewsOutput = inferProcedureOutput<AppRouter["news"]["getNews"]>;
export type NewsPostItem = GetNewsOutput["data"][number];

type NewsPostListProps = {
  userMap: Record<string, { id: string; name: string | null } | null>;
};

const getTextFromBodyJSON = (json: JsonObject): string => {
  if (!json) return "";

  if (json.type === "text" && typeof json.text === "string") {
    return json.text;
  }

  if (Array.isArray(json.content)) {
    return json.content
      .map((item) =>
        item && typeof item === "object"
          ? getTextFromBodyJSON(item as JsonObject)
          : "",
      )
      .join(" ");
  }

  return "";
};

function NewsListSkeleton() {
  return (
    <div className="flex flex-col px-4 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="flex flex-col h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 min-h-[3rem]">
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <Separator className="my-3" />
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NewsPostList({ userMap }: NewsPostListProps) {
  const { isAdmin } = useAuthContext();
  const { departmentId, teamId } = useProcedureRouteContext();
  const { markNewsRead, isPending: isMarkReadPending } = useMarkNewsRead();
  const { data, isLoading, error } = trpc.news.getNews.useQuery({
    departmentId,
    teamId,
  });

  if (isLoading) {
    return <NewsListSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading news posts"
        body={error.message || "Failed to load news posts"}
      />
    );
  }

  const newsPosts = data?.data ?? [];

  if (!newsPosts.length) {
    return (
      <EmptyState
        title="No news posts found"
        body="Create a news post to get started"
      />
    );
  }

  const pinnedNewsPosts = newsPosts.filter((newsPost) => newsPost.pinned);
  const unpinnedNewsPosts = newsPosts.filter((newsPost) => !newsPost.pinned);

  return (
    <div className="flex flex-col gap-6 mb-8">
      {pinnedNewsPosts.map((newsPost) => {
        const postUser = userMap[newsPost.createdBy ?? ""];
        const isUnread = !newsPost.isRead;
        return (
          <Fragment key={newsPost.id}>
            <Card className="flex flex-col h-full animate-fade-from-top shadow-none border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 min-h-[3rem]">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <CardTitle className="line-clamp-2 font-serif font-medium text-lg">
                      {newsPost.title}
                    </CardTitle>
                    {isUnread && (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-red-700"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="flex gap-2 justify-start items-center mb-2">
                    <p className="text-sm text-muted-foreground flex gap-2">
                      <PinIcon className="w-4 h-4" /> Pinned
                    </p>
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNewsRead(newsPost.id)}
                        disabled={isMarkReadPending}
                        className="gap-1.5"
                      >
                        {isMarkReadPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCheck className="w-4 h-4" />
                            Mark as read
                          </>
                        )}
                      </Button>
                    )}
                    {isAdmin ? (
                      <NewsDeleteButton newsPostId={newsPost.id} />
                    ) : null}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {getTextFromBodyJSON(newsPost.body as JsonObject)}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between mb-2">
                <Separator className="mb-4" />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Posted by {postUser?.name ?? "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Posted on{" "}
                    {new Date(newsPost.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Fragment>
        );
      })}

      <Separator />

      {unpinnedNewsPosts.map((newsPost) => {
        const postUser = userMap[newsPost.createdBy ?? ""];
        const isUnread = !newsPost.isRead;
        return (
          <Card
            key={newsPost.id}
            className="flex flex-col h-full shadow-none border"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 min-h-[3rem]">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <CardTitle className="font-serif font-medium text-lg line-clamp-2">
                    {newsPost.title}
                  </CardTitle>
                  {isUnread && (
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-red-700"
                      aria-hidden
                    />
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markNewsRead(newsPost.id)}
                      disabled={isMarkReadPending}
                      className="gap-1.5"
                    >
                      {isMarkReadPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCheck className="w-4 h-4" />
                          Mark as read
                        </>
                      )}
                    </Button>
                  )}
                  {isAdmin ? (
                    <NewsDeleteButton newsPostId={newsPost.id} />
                  ) : null}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {getTextFromBodyJSON(newsPost.body as JsonObject)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <Separator className="my-3" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Posted by {postUser?.name ?? "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Posted on {new Date(newsPost.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
