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
import { PencilIcon } from "lucide-react";
import { useState } from "react";

type TeamRenameDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  departmentId: string;
  teamName: string;
};
const TeamRenameDialog = ({
  title,
  description,
  action,
  actionState,
  departmentId,
  teamName,
}: TeamRenameDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full max-w-[125px]"
        >
          <PencilIcon className="w-4 h-4" />
          Rename
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
          <input type="hidden" name="oldTeamName" value={teamName} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            <Input
              id="newTeamName"
              name="newTeamName"
              type="text"
              placeholder={teamName}
              defaultValue={teamName}
              required
            />
            <FieldError actionState={actionState} name="newTeamName" />
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
            <SubmitButton className="w-[75px]" label="Rename" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { TeamRenameDialog };
