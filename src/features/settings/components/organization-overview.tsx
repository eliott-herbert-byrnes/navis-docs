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
            <CardDescription>
              Manage the organization settings
              <p className="text-sm text-red-500 mt-2">
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
