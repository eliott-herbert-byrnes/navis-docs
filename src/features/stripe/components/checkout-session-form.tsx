"use client";
import { Form } from "@/components/form/form";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "../actions/create-checkout-session";
import { Badge } from "@/components/ui/badge";

type Plan = "business" | "enterprise";

type CheckoutSessionFormProps = {
  orgSlug: string | null | undefined;
  priceId: string;
  activePlan: string | null | undefined;
  targetPlan: Plan;
  children: React.ReactNode;
  activeSubscription: boolean;
};

const CheckoutSessionForm = ({
  orgSlug,
  priceId,
  children,
  activePlan,
  targetPlan,
  activeSubscription,
}: CheckoutSessionFormProps) => {
  const [actionState, action] = useActionState(
    createCheckoutSession.bind(null, orgSlug, priceId),
    EMPTY_ACTION_STATE
  );

  const normalizedActivePlan = (activePlan ?? "").toLowerCase() as Plan | "";
  const isActivePlan =
    activeSubscription && normalizedActivePlan === targetPlan;

  return (
    <Form
      action={action}
      actionState={actionState}
      className="flex flex-row gap-2"
    >
      <Button
        type="submit"
        disabled={isActivePlan}
        className="flex flex-col gap-0"
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
