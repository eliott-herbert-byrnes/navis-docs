"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { newsPath } from "@/app/paths";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LucideLoaderCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { useNewsCreate } from "../hook/use-news-mutations";

type NewsCreateFormProps = {
  departmentId: string;
  teamId: string;
  teamName: string;
};

const NewsCreateForm = ({
  departmentId,
  teamId,
  teamName,
}: NewsCreateFormProps) => {
  const [isCancelPending, startTransition] = useTransition();
  const router = useRouter();
  const [pinned, setPinned] = useState(false);

  const { createNews, isPending } = useNewsCreate(() => {
    router.replace(newsPath(departmentId, teamId));
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createNews({
      teamId,
      newsPostTitle: String(formData.get("newsPostTitle") ?? "").trim(),
      newsPostBody: String(formData.get("newsPostBody") ?? "").trim(),
      pinned,
    });
  };

  const handlePinnedChange = (checked: boolean) => {
    setPinned(checked);
  };

  const handleCancel = () => {
    startTransition(() => {
      router.replace(newsPath(departmentId, teamId));
    });
  };

  return (
    <div className="w-full max-w-[700px] mx-auto my-auto">
      <Card className="p-6 animate-fade-from-top">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Create a news post for {teamName}</FieldLegend>
              <FieldDescription>
                Enter the details of the news post to create a new one.
              </FieldDescription>
              <FieldSeparator />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="newsPostTitle">Title</FieldLabel>
                  <Input
                    id="newsPostTitle"
                    placeholder="News Post Title"
                    name="newsPostTitle"
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="newsPostBody">Body</FieldLabel>
                  <Textarea
                    id="newsPostBody"
                    name="newsPostBody"
                    placeholder="Enter the body of the news post"
                    rows={10}
                    required
                    disabled={isPending}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Pinned</FieldLegend>
              <FieldDescription>
                Select if the news post should be pinned to the top of the news
                feed.
              </FieldDescription>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox
                    id="pinned"
                    name="pinned"
                    checked={pinned}
                    onCheckedChange={handlePinnedChange}
                    disabled={isPending}
                  />
                  <FieldLabel htmlFor="pinned" className="font-normal">
                    Pin to the top of the news feed
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <Field orientation="horizontal">
              <Button type="submit" disabled={isPending || isCancelPending}>
                {isPending ? (
                  <>
                    <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                disabled={isPending || isCancelPending}
              >
                {isCancelPending ? (
                  <LucideLoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Card>
    </div>
  );
};

export { NewsCreateForm };
