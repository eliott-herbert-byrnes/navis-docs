"use client";

import { Form } from "@/components/form/form";
import { Organization } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/form/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { updateOrganization } from "../actions/update-organization";
import { useActionState } from "react";

type OrganizationOverviewProps = {
  org: Organization;
};

const OrganizationOverview = ({ org }: OrganizationOverviewProps) => {
  const [actionState, action] = useActionState(
    updateOrganization,
    EMPTY_ACTION_STATE
  );

  return (
    <Form
      action={action}
      actionState={actionState}
      className="flex flex-col gap-4 w-full max-w-[450px] mx-auto"
    >
      <input type="hidden" name="orgId" value={org.id} />
      <div className="flex w-full flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>
              Manage the organization settings
              <p className="text-sm text-muted-foreground text-red-500 mt-2">
                Export / Delete Organization disabled for MVP
              </p>
            </CardDescription>
          </CardHeader>
          <Separator />

          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3">
              <Label>Rename Organization</Label>
              <Input
                name="orgName"
                id="orgName"
                type="text"
                defaultValue={org.name}
              />
              <FieldError actionState={actionState} name="orgName" />
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Export</CardTitle>
                <CardDescription>
                  Export the organization and user data
                </CardDescription>
              </div>
              <Button className="max-w-[150px]" disabled>
                Organization Data
              </Button>
              <Button className="max-w-[150px]" disabled>
                User Data
              </Button>
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Delete Organization</CardTitle>
                <CardDescription>
                  Delete the organization and all its data
                </CardDescription>
              </div>
              {/* TODO: Implement OrganizationDeleteButton component */}
              {/* <OrganizationDeleteButton orgId={org.id} /> */}
              <Button className="max-w-[150px]" disabled>
                Delete Organization
              </Button>
            </div>
            <Separator />
            <SubmitButton label="Update" className="w-[75px]" disabled />
          </CardContent>
        </Card>
      </div>
    </Form>
  );
};

export { OrganizationOverview };
