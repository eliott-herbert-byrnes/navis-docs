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
import { DepartmentTeamTable } from "./department-team-table";
import { DepartmentDeleteButtonSettings } from "../department-buttons/department-delete-button-settings";

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
  const [currentTab, setCurrentTab] = useState('Settings');

  const handleUpdate = () => {
    onConfirm(title, newDepartmentName);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" className="rounded-none justify-start font-normal">
          <div className="flex flex-row gap-2 items-center">
            <EyeIcon className="w-4 h-4" />
            Overview
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mt-4">{title}</DialogTitle>
        </DialogHeader>
        <Separator />

        <div className="flex w-full flex-col">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="flex flex-row gap-2 mb-0">
              <TabsTrigger value="Settings">Settings</TabsTrigger>
              <TabsTrigger value="Teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="Settings">
              <Card className="animate-fade-from-top border-none shadow-none py-2 px-1">
                <CardHeader className="px-1 gap-1">
                  <CardTitle className="text-md">Department Settings</CardTitle>
                  <CardDescription>
                    Manage the department settings
                  </CardDescription>
                <Separator className="mt-2"/>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 px-1">
                  <div className="grid gap-3">
                    <Label htmlFor="newDepartmentName" className="text-md">Rename Department</Label>
                    <Input
                      name="newDepartmentName"
                      id="newDepartmentName"
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="border-1 shadow-none"
                    />
                  </div>
                  <Separator />
                  <div className="grid gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-md">Export</CardTitle>
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
                      <CardTitle className="text-md">Delete Department</CardTitle>
                      <CardDescription>
                        Delete the department and all its data
                      </CardDescription>
                    </div>
                    <DepartmentDeleteButtonSettings
                      departmentId={departmentId}
                      departmentName={title}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="Teams">
              <Card className="max-w-[450px] animate-fade-from-top shadow-none gap-2 py-2">
                <CardHeader className="px-1 mb-4">
                  <CardTitle className="mt-1">Teams</CardTitle>
                  <CardDescription>
                    Manage teams in the department
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="px-1">
                  <DepartmentTeamTable departmentId={departmentId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {currentTab === 'Settings' && (
          <div className="flex flex-col gap-2 px-1">
        <Separator />
          <DialogFooter className="flex flex-row gap-2 mt-2">
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
              </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { DepartmentOverview };
