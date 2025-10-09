"use client";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { ActionState } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
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
import { PlusIcon } from "lucide-react";
import { useState } from "react";

type DepartmentTeamDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  disabled: boolean;
  departmentId: string;
};
const DepartmentTeamDialog = ({
  title,
  description,
  disabled,
  action,
  actionState,
  departmentId,
}: DepartmentTeamDialogProps) => {
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
          <PlusIcon className="w-4 h-4" />
          Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleClose}
          onError={handleClose}
        >
          <input type="hidden" name="departmentId" value={departmentId} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            <Input
              id="teamName"
              name="teamName"
              type="text"
              placeholder="Team Name"
              required
            />
            <FieldError actionState={actionState} name="teamName" />
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 mt-4">
            <Button
              className="w-[75px]"
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <SubmitButton className="w-[75px]" label="Add" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { DepartmentTeamDialog };
