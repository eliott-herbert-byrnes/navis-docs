"use client";

import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrganization } from "../actions/create-organization";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const OnboardingForm = () => {
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
    <div>
      <Form action={action} actionState={actionState} className="max-w-lg mx-auto flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold">Organization</h1>
          <p className="text-sm text-muted-foreground">Create your organization to get started</p>
        </div>

        <Input id="org-name" name="name" type="text" placeholder="Terra Nova Inc." required />
        <FieldError actionState={actionState} name="name" />

        <Button type="submit" disabled={isPending}>Create Organization</Button>
      </Form>
    </div>
  );
};

export { OnboardingForm };
