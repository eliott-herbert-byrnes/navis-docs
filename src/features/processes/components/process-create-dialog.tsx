"use client";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { ActionState } from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SubmitButton } from "@/features/invite/components/submit-button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

type ProcessDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  disabled: boolean;
};
const ProcessDialog = ({
  title,
  description,
  action,
  actionState,
  disabled,
}: ProcessDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <PlusIcon className="w-4 h-4" />
          Create Process
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
          <div className="flex flex-col gap-3">
            <Input
              id="processTitle"
              name="processTitle"
              type="text"
              placeholder="Process Title"
              required
            />
            <FieldError actionState={actionState} name="processTitle" />
            <Input
              id="processDescription"
              name="processDescription"
              type="textarea"
              placeholder="Process Description"
              required
            />
            <FieldError actionState={actionState} name="processDescription" />
            <Separator />
            <Select name="categoryId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Category 1</SelectItem>
                <SelectItem value="2">Category 2</SelectItem>
                <SelectItem value="3">Category 3</SelectItem>
                <SelectItem value="4">Category 4</SelectItem>
              </SelectContent>
            </Select>
            <FieldError actionState={actionState} name="categoryId" />
            <Separator />
            <div className="flex items-center space-x-2">
              <Checkbox id="newCategory" />
              <Label htmlFor="newCategory">New category</Label>
              <Input
                id="newCategoryName"
                name="newCategoryName"
                type="text"
                placeholder="New Category Name"
                required
              />
              <FieldError actionState={actionState} name="newCategoryName" />
            </div>
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
            <SubmitButton className="w-[75px]" label="Create" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { ProcessDialog };
