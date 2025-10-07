"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { createOrganization } from "../actions/create-organization";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { useEffect } from "react";
import { Form } from "@/components/form/form";
import { FieldError } from "@/components/form/field-error";

export function OnboardForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [actionState, action, isPending] = useActionState(
    createOrganization,
    EMPTY_ACTION_STATE
  );

  useEffect(() => {
    if (actionState.status !== "SUCCESS") return;
    const to = actionState.data?.redirect;
    if (to) router.replace(to);
  }, [actionState.status, actionState.data?.redirect, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your organization</CardTitle>
          <CardDescription>
            Enter your organization name below to create your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={action} actionState={actionState}>
            <FieldGroup>
              <Field>
                <Input
                  id="org-name"
                  name="name"
                  type="text"
                  placeholder="Terra Nova Inc."
                  required
                />
                <FieldError actionState={actionState} name="name" />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>Create Organization</Button>
              </Field>
            </FieldGroup>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
