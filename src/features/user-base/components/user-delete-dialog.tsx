"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessDialogTrigger } from "@/components/ui/access-button";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

type UserDeleteDialogProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const UserDeleteDialog = ({
  title,
  description,
  onConfirm,
  isPending,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UserDeleteDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleClose = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <AccessDialogTrigger adminOnly>
          <Button variant="ghost" className="w-full flex justify-start gap-2 rounded-none">
            <TrashIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-normal">Delete</span>
          </Button>
        </AccessDialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-red-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            className="w-[75px]"
            type="button"
            variant="default"
            onClick={handleClose}
            isLoading={isPending}
          >
            Delete
          </Button>
          <Button
            className="w-[75px]"
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { UserDeleteDialog };
