"use client";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { validateDepartmentForm } from "../../utils/validate-department";
import { AccessDialogTrigger } from "@/components/ui/access-button";

type DepartmentDialogProps = {
  title: string;
  description: string;
  onConfirm: (
    departmentName: string,
    teamName1: string,
    teamName2?: string,
    teamName3?: string,
  ) => void;
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
const DepartmentDialog = ({
  title,
  description,
  onConfirm,
  isPending,
  open,
  onOpenChange,
}: DepartmentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [teamName1, setTeamName1] = useState("");
  const [teamName2, setTeamName2] = useState("");
  const [teamName3, setTeamName3] = useState("");
  const handleCreate = () => {
    const validation = validateDepartmentForm({
      departmentName,
      teamName1,
      teamName2,
      teamName3,
    });
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    onConfirm(departmentName, teamName1, teamName2, teamName3);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setDepartmentName("");
      setTeamName1("");
      setTeamName2("");
      setTeamName3("");
    }
  };

  const isValid =
    departmentName.trim().length > 0 && teamName1.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AccessDialogTrigger adminOnly>
        <Button variant="outline">Actions</Button>
      </AccessDialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Input
          id="departmentName"
          name="departmentName"
          type="text"
          placeholder="Department Name"
          required
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          className="border shadow-none"
        />
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="flex w-full flex-col gap-2 mt-2"
        >
          <div className="flex items-center justify-between gap-4 w-full ">
            <h4 className="text-sm font-semibold">Add team</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10">
                <ChevronsUpDown />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <Input
            id="teamName1"
            name="teamName1"
            type="text"
            placeholder="Team Name"
            required
            value={teamName1}
            onChange={(e) => setTeamName1(e.target.value)}
            className="shadow-none border"
          />
          <CollapsibleContent className="flex flex-col gap-2">
            <Input
              id="teamName2"
              name="teamName2"
              type="text"
              placeholder="Team Name"
              value={teamName2}
              onChange={(e) => setTeamName2(e.target.value)}
              className="shadow-none border"
            />
            <Input
              id="teamName3"
              name="teamName3"
              type="text"
              placeholder="Team Name"
              value={teamName3}
              onChange={(e) => setTeamName3(e.target.value)}
              className="shadow-none border"
            />
          </CollapsibleContent>
        </Collapsible>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            className="w-[75px]"
            type="button"
            variant="default"
            onClick={handleCreate}
            disabled={isPending || !isValid}
          >
            Create
          </Button>
          <Button
            className="w-[75px]"
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DepartmentDialog };
