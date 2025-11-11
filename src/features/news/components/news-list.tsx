import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PinIcon } from "lucide-react";
import { getNewsPosts } from "../queries/get-news-posts";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";
import { getSessionUser, getUserById, isOrgAdminOrOwner } from "@/lib/auth";
import { NewsDeleteButton } from "./news-delete-button";
import { signInPath } from "@/app/paths";
import { redirect } from "next/navigation";
import { JsonObject } from "@prisma/client/runtime/library";

type NewsPostListProps = {
  departmentId: string;
  teamId: string;
};

export async function NewsPostList({
  departmentId,
  teamId,
}: NewsPostListProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath());
  }

  const isAdmin = await isOrgAdminOrOwner(user.userId);

  const newsPosts = await getNewsPosts(departmentId, teamId);

  const pinnedNewsPosts = newsPosts.filter((newsPost) => newsPost.pinned);
  const unpinnedNewsPosts = newsPosts.filter((newsPost) => !newsPost.pinned);

  if (!newsPosts.length) {
    return (
      <EmptyState
        title="No news posts found"
        body="Create a news post to get started"
      />
    );
  }

  const uniqueUserIds = [...new Set(newsPosts.map((post) => post.createdBy))];
  const users = await Promise.all(
    uniqueUserIds.map((userId) => getUserById(userId ?? ""))
  );
  const userMap = Object.fromEntries(users.map((user) => [user?.id, user]));

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
            : ""
        )
        .join(" ");
    }

    return "";
  };

  return (
    <div className="flex flex-col px-4 gap-4">
      {pinnedNewsPosts.map((newsPost) => {
        const postUser = userMap[newsPost.createdBy ?? ""];
        return (
          <Fragment key={newsPost.id}>
            <Card className="hover:border-primary transition-colors flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 min-h-[3rem]">
                  <CardTitle className="text-base hover:text-primary transition-colors line-clamp-2">
                    {newsPost.title}
                  </CardTitle>
                  <div className="flex gap-2 justify-start items-center mb-2">
                    <p className="text-sm text-muted-foreground flex gap-2">
                      <PinIcon className="w-4 h-4" /> Pinned
                    </p>
                    {isAdmin ? (
                      <NewsDeleteButton
                        newsPostId={newsPost.id}
                        departmentId={departmentId}
                        teamId={teamId}
                      />
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
        return (
          <Card
            key={newsPost.id}
            className="hover:border-primary transition-colors flex flex-col h-full"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 min-h-[3rem]">
                <CardTitle className="text-base hover:text-primary transition-colors line-clamp-2">
                  {newsPost.title}
                </CardTitle>
                {isAdmin ? (
                  <NewsDeleteButton
                    newsPostId={newsPost.id}
                    departmentId={departmentId}
                    teamId={teamId}
                  />
                ) : null}
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
