"use client";

import { Organization } from "@prisma/client";
import { useRenameOrganization } from "../hooks/use-organization-mutations";
import React, { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CreditCard, FolderPen, Loader2 } from "lucide-react";
import { ExportProcedureOrgDataButton } from "./export-procedure-org-data-button";
import { ExportUserOrgDataButton } from "./export-user-org-data-button";
import { OrganizationDeleteButton } from "@/features/org/components/org-delete-button-dialog";
import { createCustomerPortal } from "@/features/stripe/actions/create-customer-portal";
import { toast } from "sonner";

type OrganizationOverviewProps = {
  org: Organization;
};

const OrganizationOverview = ({ org }: OrganizationOverviewProps) => {
  const [orgName, setOrgName] = useState(org.name);
  const { renameOrganization, isLoading } = useRenameOrganization();
  const [isPending, startTransition] = useTransition();

  const handleManageSubscription = () => {
    startTransition(async () => {
      try {
        await createCustomerPortal();
      } catch (e) {
        toast.error("Could not open billing. Please try again.");
      }
    });
  };

  const handleUpdate = () => {
    renameOrganization({ orgId: org.id, orgName: orgName });
  };

  return (
    <div className="flex flex-col w-full max-w-[450px] mx-auto">
      <div className="flex w-full flex-col">
        <Card className="animate-fade-from-top">
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Manage the organization settings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Separator />
            <div className="grid gap-3">
              <Input
                name="orgName"
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <Button
                onClick={handleUpdate}
                disabled={isLoading}
                variant="outline"
                className="w-full flex justify-start gap-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <FolderPen className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Rename Organization</span>
                  </>
                )}
              </Button>
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Export</CardTitle>
                <CardDescription>
                  Export the organization and user data
                </CardDescription>
              </div>
              <ExportProcedureOrgDataButton />
              <ExportUserOrgDataButton />
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Billing</CardTitle>
                <CardDescription>
                  Manage your organizations subscription
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="w-full flex justify-start gap-4"
                onClick={handleManageSubscription}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-semibold">Manage Subscription</span>
              </Button>
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Delete Organization</CardTitle>
                <CardDescription>
                  Delete the organization and all its data. This action will
                  also automatically cancel any active subscriptions.
                </CardDescription>
              </div>
              {/* TODO: Implement OrganizationDeleteButton component */}
              <OrganizationDeleteButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { OrganizationOverview };
