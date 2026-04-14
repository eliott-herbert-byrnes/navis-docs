"use client";
import { Form } from "@/components/form/form";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { createCustomerPortal } from "../actions/create-customer-portal";

type CustomerPortalFormProps = {
  children: React.ReactNode;
};

const CustomerPortalForm = ({ children }: CustomerPortalFormProps) => {
  const [actionState, action] = useActionState(
    createCustomerPortal.bind(null),
    EMPTY_ACTION_STATE,
  );

  return (
    <Form action={action} actionState={actionState} className="w-full">
      <Button className="w-full text-sm shadow-none" variant="outline" type="submit">
        {children}
      </Button>
    </Form>
  );
};

export { CustomerPortalForm };
