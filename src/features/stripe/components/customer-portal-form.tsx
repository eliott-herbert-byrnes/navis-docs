"use client";
import { Form } from "@/components/form/form";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { createCustomerPortal } from "../actions/create-customer-portal";

type CustomerPortalFormProps = {
    orgSlug: string;
    children: React.ReactNode;
}

const CustomerPortalForm = ({ orgSlug, children }: CustomerPortalFormProps) => {
    const [actionState, action] = useActionState(
        createCustomerPortal.bind(null, orgSlug),
        EMPTY_ACTION_STATE
    )

    return (
        <Form action={action} actionState={actionState}>
            <Button className="text-sm" variant="outline" type="submit">{children}</Button>
        </Form>
    )
}

export { CustomerPortalForm };