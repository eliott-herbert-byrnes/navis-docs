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
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { Lightbulb } from "lucide-react";
import { useState } from "react";

type ProcessIdeaDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  teamId: string;
};
const ProcessIdeaDialog = ({
  title,
  description,
  action,
  actionState,
  teamId,
}: ProcessIdeaDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Lightbulb className="h-4 w-4" />
          Submit Idea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleClose}
          onError={handleClose}
        >
          <input type="hidden" name="teamId" value={teamId} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
          <Input
            name="ideaTitle"
            placeholder="Title of the idea..."
            required
          />
          <FieldError actionState={actionState} name="ideaTitle" />
          <Textarea
            name="ideaBody"
            placeholder="Describe the idea..."
            required
              rows={10}
            />
            <FieldError actionState={actionState} name="ideaBody" />
          </div>
          <DialogFooter className="flex flex-row gap-2 mt-4">
            <Button
              className="w-[75px]"
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <SubmitButton className="w-[75px]" label="Submit" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { ProcessIdeaDialog };
