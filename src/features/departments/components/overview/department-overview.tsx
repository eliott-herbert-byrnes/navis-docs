"use client";
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
import { EyeIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { DepartmentDeleteButton } from "../department-buttons/department-delete-button";
import { DepartmentTeamTable } from "./department-team-table";

type DepartmentOverviewProps = {
  title: string;
  disabled: boolean;
  departmentId: string;
  onConfirm: (oldDepartmentName: string, newDepartmentName: string) => void;
  isPending: boolean;
};
const DepartmentOverview = ({
  title,
  disabled,
  departmentId,
  onConfirm,
  isPending,
}: DepartmentOverviewProps) => {
  const [open, setOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState(title);

  const handleUpdate = () => {
    onConfirm(title, newDepartmentName);
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
              <Card className="animate-fade-from-top">
                <CardHeader>
                  <CardTitle>Department Settings</CardTitle>
                  <CardDescription>
                    Manage the department settings
                    <p className="text-sm text-red-500 mt-2">
                      Export Department disabled for MVP
                    </p>
                  </CardDescription>
                </CardHeader>
                <Separator />

                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="newDepartmentName">Rename Department</Label>
                    <Input
                      name="newDepartmentName"
                      id="newDepartmentName"
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
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
                    <DepartmentDeleteButton
                      departmentId={departmentId}
                      departmentName={title}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="Teams">
              <Card className="max-w-[450px] animate-fade-from-top">
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
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="w-[75px]"
            type="button"
            variant="default"
            onClick={handleUpdate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DepartmentOverview };
