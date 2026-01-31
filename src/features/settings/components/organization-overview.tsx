"use client";

import { Organization } from "@prisma/client";
import { useRenameOrganization } from "../hooks/use-organization-mutations";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { ExportProcedureOrgDataButton } from "./export-procedure-org-data-button";
import { ExportUserOrgDataButton } from "./export-user-org-data-button";
import { OrganizationDeleteButton } from "@/features/org/components/org-delete-button-dialog";

type OrganizationOverviewProps = {
  org: Organization;
};

const OrganizationOverview = ({ org }: OrganizationOverviewProps) => {
  const [orgName, setOrgName] = useState(org.name);
  const { renameOrganization, isPending } = useRenameOrganization();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    renameOrganization({ orgId: org.id, orgName: orgName });
  };

  return (
    <form
      className="flex flex-col gap-4 w-full max-w-[450px] mx-auto"
      onSubmit={handleUpdate}
    >
      <div className="flex w-full flex-col">
        <Card className="animate-fade-from-top">
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Manage the organization settings</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <Separator />
            <div className="grid gap-3">
              <Label>Rename Organization</Label>
              <Input
                name="orgName"
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
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
                <CardTitle>Delete Organization</CardTitle>
                <CardDescription>
                  Delete the organization and all its data. This action will also automatically cancel any active subscriptions.
                </CardDescription>
              </div>
              {/* TODO: Implement OrganizationDeleteButton component */}
              <OrganizationDeleteButton />
            </div>
            <Separator />
            <Button className="w-[75px]" type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Rename"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export { OrganizationOverview };
