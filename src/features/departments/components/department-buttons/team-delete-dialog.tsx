"use client";
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
import { SubmitButton } from "@/features/invite/components/submit-button";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

type TeamDeleteDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  departmentId: string;
  teamName: string;
};
const TeamDeleteDialog = ({
  title,
  description,
  action,
  actionState,
  departmentId,
  teamName,
  onSuccess,
}: TeamDeleteDialogProps & { onSuccess?: () => void }) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
      setOpen(false);
    if(onSuccess) {
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full max-w-[125px]"
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleSuccess}
          onError={() => setOpen(false)}
        >
          <input type="hidden" name="departmentId" value={departmentId} />
          <input type="hidden" name="teamName" value={teamName} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 mt-4">
            <Button
              className="w-[75px]"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton className="w-[75px]" label="Delete" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { TeamDeleteDialog };
