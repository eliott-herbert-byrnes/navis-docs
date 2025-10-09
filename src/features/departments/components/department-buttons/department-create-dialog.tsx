"use client";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { ActionState } from "@/components/form/utils/to-action-state";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { ChevronsUpDown, PlusIcon } from "lucide-react";
import { useState } from "react";

type DepartmentDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  disabled: boolean;
};
const DepartmentDialog = ({
  title,
  description,
  action,
  actionState,
  disabled,
}: DepartmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <PlusIcon className="w-4 h-4" />
          Create Department
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleClose}
          onError={handleClose}
        >
          <Input
            id="departmentName"
            name="departmentName"
            type="text"
            placeholder="Department Name"
            required
          />
          <FieldError actionState={actionState} name="departmentName" />
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
            <div className="rounded-md border px-4 py-2 font-mono text-sm">
              <Input
                id="teamName1"
                name="teamName1"
                type="text"
                placeholder="Team Name"
                required
              />
              <FieldError actionState={actionState} name="teamName1" />
            </div>
            <CollapsibleContent className="flex flex-col gap-2">
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                <Input
                  id="teamName2"
                  name="teamName2"
                  type="text"
                  placeholder="Team Name"
                />
                <FieldError actionState={actionState} name="teamName2" />
              </div>
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                <Input
                  id="teamName3"
                  name="teamName3"
                  type="text"
                  placeholder="Team Name"
                />
                <FieldError actionState={actionState} name="teamName3" />
              </div>
            </CollapsibleContent>
          </Collapsible>
          <DialogFooter className="flex flex-row gap-2 mt-4">
            <Button
              className="w-[75px]"
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <SubmitButton className="w-[75px]" label="Create" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { DepartmentDialog };
