"use client";
import { Form } from "@/components/form/form";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "../actions/create-checkout-session";
import { Badge } from "@/components/ui/badge";

type CheckoutSessionFormProps = {
  orgSlug: string | null | undefined;
  priceId: string;
  activePlan: string | null | undefined;
  children: React.ReactNode;
  activeSubscription: boolean;
};

const CheckoutSessionForm = ({
  orgSlug,
  priceId,
  children,
  activePlan,
  activeSubscription,
}: CheckoutSessionFormProps) => {
  const [actionState, action] = useActionState(
    createCheckoutSession.bind(null, orgSlug, priceId),
    EMPTY_ACTION_STATE,
  );

  const normalizedActivePlan = (activePlan ?? "").toLowerCase();
  const isActivePlan = activeSubscription && normalizedActivePlan === "pro";

  return (
    <Form
      action={action}
      actionState={actionState}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch"
    >
      <Button
        type="submit"
        disabled={isActivePlan}
        className="flex w-full flex-col gap-0 sm:flex-1"
      >
        <div>{children}</div>
      </Button>
      {isActivePlan && (
        <Badge className="h-9" variant="outline">
          <span className="text-sm">Active</span>
        </Badge>
      )}
    </Form>
  );
};

export { CheckoutSessionForm };
