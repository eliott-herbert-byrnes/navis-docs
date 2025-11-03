"use client";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { ActionState } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { DepartmentDeleteButton } from "../department-buttons/department-delete-button";
import { DepartmentTeamTable } from "./department-team-table";

type DepartmentOverviewProps = {
  title: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  disabled: boolean;
  departmentId: string;
  isAdmin: boolean;
};
const DepartmentOverview = ({
  title,
  disabled,
  action,
  actionState,
  departmentId,
  isAdmin,
}: DepartmentOverviewProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full max-w-[125px]"
        >
          <EyeIcon className="w-4 h-4" />
          Overview
        </Button>
      </DialogTrigger>

      <DialogContent>
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleClose}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="departmentId" value={departmentId} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <Separator />

          <div className="flex w-full flex-col">
            <Tabs defaultValue="Settings">
              <TabsList className="flex flex-row gap-2 mb-2">
                <TabsTrigger value="Settings">Settings</TabsTrigger>
                <TabsTrigger value="Teams">Teams</TabsTrigger>
              </TabsList>

              <TabsContent value="Settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Settings</CardTitle>
                    <CardDescription>
                      Manage the department settings
                    </CardDescription>
                  </CardHeader>
                  <Separator />

                  <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="departmentName">Rename Department</Label>
                      <Input
                        name="departmentName"
                        id="departmentName"
                        type="text"
                        defaultValue={title}
                      />
                      <FieldError
                        actionState={actionState}
                        name="departmentName"
                      />
                    </div>
                    <Separator />
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1">
                        <CardTitle>Export</CardTitle>
                        <CardDescription>
                          Export the department and user data
                        </CardDescription>
                      </div>
                      <Button className="max-w-[150px]" disabled>
                        Department Data
                      </Button>
                      <Button className="max-w-[150px]" disabled>
                        User Data
                      </Button>
                    </div>
                    <Separator />
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1">
                        <CardTitle>Delete Department</CardTitle>
                        <CardDescription>
                          Delete the department and all its data
                        </CardDescription>
                      </div>
                      <DepartmentDeleteButton departmentId={departmentId} isAdmin={isAdmin} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="Teams">
                <Card className="max-w-[450px]">
                  <CardHeader>
                    <CardTitle>Teams</CardTitle>
                    <CardDescription>
                      Manage teams in the department
                    </CardDescription>
                  </CardHeader>
                  <Separator />

                  <CardContent className="">
                    <DepartmentTeamTable departmentId={departmentId} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <Separator />
          <DialogFooter className="flex flex-row gap-2">
            <Button
              className="w-[75px]"
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <SubmitButton className="w-[75px]" label="Update" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { DepartmentOverview };
