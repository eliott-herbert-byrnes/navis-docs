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
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProcessErrorDialogProps = {
  processId: string;
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
};

export const ProcessErrorDialog = ({
  processId,
  title,
  description,
  action,
  actionState,
}: ProcessErrorDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  const handleClose = () => {
    console.log("Closing dialog");
    setOpen(false);
  };

  const handleSuccess = () => {
    console.log("Success callback triggered!");
    handleClose();
    // Reset the form by changing the key
    setKey((prev) => prev + 1);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Flag className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form
          key={key}
          action={action}
          actionState={actionState}
          onSuccess={handleSuccess}
          onError={handleClose}
        >
          <input type="hidden" name="processId" value={processId} />
          <Textarea
            name="errorReport"
            placeholder="Describe the issue with this process..."
            required
            rows={10}
          />
          <FieldError actionState={actionState} name="errorReport" />
          <DialogFooter className="flex flex-row gap-2 mt-4">
            <Button
              className="w-[75px]"
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <SubmitButton className="w-[75px]" label="Report" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
