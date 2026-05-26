"use client";

import { Organization } from "@prisma/client";
import { useRenameOrganization } from "../hooks/use-organization-mutations";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getOrganizationNameValidationMessage,
  ORG_NAME_MAX_LENGTH_RENAME,
} from "@/lib/org-name";
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

  const trimmedOrgName = orgName.trim();
  const validationMessage = getOrganizationNameValidationMessage(
    trimmedOrgName,
    ORG_NAME_MAX_LENGTH_RENAME,
  );
  const isNameInvalid = validationMessage !== null;
  const isUnchanged = trimmedOrgName === org.name;
  const isRenameDisabled = isLoading || isNameInvalid || isUnchanged;

  const handleManageSubscription = () => {
    startTransition(async () => {
      try {
        await createCustomerPortal();
      } catch (e) {
        toast.error("Could not open billing, try again or contact support");
      }
    });
  };

  const handleUpdate = () => {
    if (isNameInvalid || isUnchanged) return;
    renameOrganization({ orgName: trimmedOrgName });
  };

  const renameButton = (
    <Button
      onClick={handleUpdate}
      disabled={isRenameDisabled}
      variant="outline"
      className="w-full flex justify-start gap-2 shadow-none border max-w-[250px]"
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
  );

  return (
    <div className="flex flex-col w-full mb-8">
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-5">
          <div className="grid gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Rename</span>
              <span className="text-sm">Rename the organization</span>
            </div>
            <Input
              name="orgName"
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              maxLength={ORG_NAME_MAX_LENGTH_RENAME}
              className="shadow-none border max-w-[250px]"
            />
            {isNameInvalid && !isLoading ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex max-w-[250px]">{renameButton}</span>
                </TooltipTrigger>
                <TooltipContent>{validationMessage}</TooltipContent>
              </Tooltip>
            ) : (
              renameButton
            )}
          </div>
          <Separator />
          <div className="grid gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Export</span>
              <span className="text-sm">
                Export the organization and user data
              </span>
            </div>
            <ExportProcedureOrgDataButton />
            <ExportUserOrgDataButton />
          </div>
          {org.stripeSubscriptionId ? (
            <>
              <Separator />
              <div className="grid gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Billing</span>
                  <span className="text-sm">
                    Manage your organizations subscription
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full flex justify-start gap-4 shadow-none max-w-[250px]"
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
            </>
          ) : null}
          <Separator />
          <div className="grid gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Delete Organization</span>
              <span className="text-sm">
                Delete the organization and all its data. This action will also
                automatically cancel any active subscriptions.
              </span>
            </div>
            <OrganizationDeleteButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export { OrganizationOverview };
