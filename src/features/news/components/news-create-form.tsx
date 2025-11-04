"use client";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Form } from "@/components/form/form";
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
import { useActionState } from "@/components/form/hooks/use-action-state";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/form/field-error";
import {  newsPath } from "@/app/paths";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LucideLoaderCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createNews } from "../actions/create-news";

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
  const [actionState, action, isPending] = useActionState(
    createNews,
    EMPTY_ACTION_STATE
  );
  const [isCancelPending, startTransition] = useTransition();
  const router = useRouter();
  const [pinned, setPinned] = useState(false);

  const handlePinnedChange = (checked: boolean) => {
    setPinned(checked);
  };

  useEffect(() => {
    if (actionState.status !== "SUCCESS") return;
    const to = actionState.data?.redirect;
    if (to) router.push(to);
  }, [actionState.status, actionState.data?.redirect, router]);

  const handleCancel = () => {
    startTransition(() => {
      router.replace(newsPath(departmentId, teamId));
    });
  };

  return (
    <div className="w-full max-w-[700px] mx-auto my-auto">
      <Card className="p-6 animate-from-top animate-duration-300">
        <Form action={action} actionState={actionState}>
          <input type="hidden" name="departmentId" value={departmentId} />
          <input type="hidden" name="teamId" value={teamId} />
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
                  <FieldError actionState={actionState} name="newsPostTitle" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="newsPostBody">
                    Body
                  </FieldLabel>
                  <Textarea
                    id="newsPostBody"
                    name="newsPostBody"
                    placeholder="Enter the body of the news post"
                    rows={10}
                    required
                    disabled={isPending}
                  />
                  <FieldError
                    actionState={actionState}
                    name="newsPostBody"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Pinned</FieldLegend>
              <FieldDescription>
                Select if the news post should be pinned to the top of the news feed.
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
                  <FieldLabel
                    htmlFor="pinned"
                    className="font-normal"
                  >
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
        </Form>
      </Card>
    </div>
  );
};

export { NewsCreateForm };
