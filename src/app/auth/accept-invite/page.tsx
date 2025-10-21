"use client";
import { CardCompact } from "@/components/auth-card";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { acceptInvite } from "@/features/invite/actions/accept-invite";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const AcceptInvitePage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [actionState, action] = useActionState(
    acceptInvite,
    EMPTY_ACTION_STATE
  );
  const router = useRouter();

  // TODO: Auto submit
  // const autoSubmit = useRef(false);
  // useEffect(() => {
  //   if (!token) return;
  //   if (actionState.status === "SUCCESS" || isPending) return;
  //   if (autoSubmit.current) return;
  //   autoSubmit.current = true;
  //   const fd = new FormData();
  //   fd.set("token", token);
  //   action(fd);
  // }, [token, action, isPending, actionState.status]);

  useEffect(() => {
    if (actionState.status !== "SUCCESS") return;
    const to = actionState.data?.redirect;
    if (to) router.replace(to);
  }, [actionState.status, actionState.data?.redirect, router]);

  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px]">
      <h2 className="text-xl font-bold">Navis Docs</h2>
      <h1 className="text-3xl font-semibold">Organization Invitation</h1>
      <CardCompact
        className="flex flex-col gap-3 mt-3 w-full"
        header={
          <Form
            action={action}
            actionState={actionState}
            className="max-w-lg mx-auto flex flex-col gap-3 animate-from-top animate-duration-300"
          >
            <Input id="token" name="token" type="hidden" value={token} />
            <FieldError actionState={actionState} name="token" />
            <p className="text-sm text-muted-foreground">
              {actionState.status === "ERROR"
                ? actionState.message ||
                  "An error occurred while accepting the invitation"
                : "You have been invited to join an organization"}
            </p>
            <SubmitButton label="Accept Invitation" />
          </Form>
        }
      />
    </div>
  );
};

export default AcceptInvitePage;
