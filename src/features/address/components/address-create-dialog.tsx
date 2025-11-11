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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FieldError } from "@/components/form/field-error";

type AddressCreateDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
};

const AddressCreateDialog = ({
  title,
  description,
  action,
  actionState,
}: AddressCreateDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleClose}
          onError={handleClose}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Address name"
                maxLength={100}
              />
              <FieldError actionState={actionState} name="name" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Street address"
                maxLength={255}
              />
              <FieldError actionState={actionState} name="address" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Phone number"
                maxLength={20}
              />
              <FieldError actionState={actionState} name="phone" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="Email address"
                type="email"
              />
              <FieldError actionState={actionState} name="email" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://example.com"
                type="url"
              />
              <FieldError actionState={actionState} name="website" />
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2">
            <Button
              className="w-[75px]"
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <SubmitButton label="Add Address" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { AddressCreateDialog };