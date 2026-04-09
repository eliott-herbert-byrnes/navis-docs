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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, FileInput } from "lucide-react";
import { useState } from "react";
import { DepartmentTeamTable } from "./department-team-table";
import { DepartmentDeleteButtonSettings } from "../department-buttons/department-delete-button-settings";
import {
  ExportFormat,
  useExportDepartmentProcedureData,
} from "../../hooks/use-export-department-procedure-data";

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
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const { isLoading: isExportLoading, exportWithFormat } =
    useExportDepartmentProcedureData(departmentId, exportOpen);

  const handleExport = () => {
    exportWithFormat(exportFormat as ExportFormat);
    setExportOpen(false);
  };

  const handleUpdate = () => {
    onConfirm(title, newDepartmentName);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="rounded-none justify-start font-normal">
          <div className="flex flex-row gap-2 items-center">
            <EyeIcon className="w-4 h-4" />
            Overview
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col max-h-[90dvh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="mt-4">{title}</DialogTitle>
        </DialogHeader>
        <Separator className="shrink-0" />

        <div className="flex-1 overflow-y-auto min-h-0">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="flex flex-row gap-2 mb-0 bg-primary/0">
              <TabsTrigger value="Settings">Settings</TabsTrigger>
              <TabsTrigger value="Teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="Settings">
              <Card className="animate-fade-from-top border-none shadow-none py-2 px-1 bg-primary/0">
                <CardHeader className="px-1 gap-1">
                  <CardTitle className="text-md">Department Settings</CardTitle>
                  <CardDescription>
                    Manage the department settings
                  </CardDescription>
                  <Separator className="mt-2" />
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
                        Export the department procedure data
                      </CardDescription>
                    </div>
                    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className={"flex justify-start gap-2 max-w-[230px] shadow-none"}
                        >
                          <FileInput className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">Department Procedure Data</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Export Department Procedures</DialogTitle>
                          <DialogDescription>
                            Export all procedure data for this department
                          </DialogDescription>
                        </DialogHeader>
                        <Select
                          name="format"
                          value={exportFormat}
                          onValueChange={setExportFormat}
                        >
                          <SelectTrigger className="w-1/2 shadow-none border">
                            <SelectValue placeholder="Select a format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="markdown">Markdown</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                        <DialogFooter className="flex flex-row gap-2 mt-4">
                          <Button
                            className="w-[75px] shadow-none border"
                            type="button"
                            variant="default"
                            onClick={handleExport}
                            isLoading={isExportLoading}
                          >
                            Export
                          </Button>
                          <Button
                            className="w-[75px] shadow-none border"
                            type="button"
                            variant="outline"
                            onClick={() => setExportOpen(false)}
                            disabled={isExportLoading}
                          >
                            Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
              <Card className="w-full animate-fade-from-top shadow-none gap-2 py-2 bg-primary/0">
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
          <div className="flex flex-col gap-2 px-1 shrink-0">
            <Separator />
            <DialogFooter className="mt-2">
              <Button
                className="shadow-none border"
                type="button"
                variant="default"
                onClick={handleUpdate}
                isLoading={isPending}
              >
                Update
              </Button>
              <Button
                className="shadow-none border"
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { DepartmentOverview };
