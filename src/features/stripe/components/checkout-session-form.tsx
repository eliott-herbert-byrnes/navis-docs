"use client";
import { Form } from "@/components/form/form";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "../actions/create-checkout-session";
import clsx from "clsx";

type CheckoutSessionFormProps = {
  orgSlug: string | null | undefined;
  priceId: string;
  activePriceId: string | null | undefined;
  children: React.ReactNode;
};

const CheckoutSessionForm = ({
  orgSlug,
  priceId,
  children,
  activePriceId,
}: CheckoutSessionFormProps) => {
  const [actionState, action] = useActionState(
    createCheckoutSession.bind(null, orgSlug, priceId),
    EMPTY_ACTION_STATE
  );
  const isActivePrice = activePriceId === priceId;

  // TODO: CHECK WHY THIS IS NOT WORKING

  return (
    <Form action={action} actionState={actionState}>
      <Button
        type="submit"
        disabled={isActivePrice}
        className={clsx("flex flex-col", {
          "h-16": !!activePriceId,
        })}
      >
        {!activePriceId ? null : isActivePrice ? (
          <span>Current Plan</span>
        ) : (
          <span>Change Plan</span>
        )}
        <div>{children}</div>
      </Button>
    </Form>
  );
};

export { CheckoutSessionForm };
