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

type CategoryDeleteDialogProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
  /** When provided, dialog is controlled and no trigger is rendered (for use in dropdowns etc.) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CategoryDeleteDialog({
  title,
  description,
  onConfirm,
  isPending,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CategoryDeleteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <AccessDialogTrigger adminOnly>
          <Button variant="ghost" className="w-full flex justify-start gap-4">
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
            className="w-[75px] shadow-none border"
            type="button"
            variant="default"
            onClick={handleConfirm}
            isLoading={isPending}
          >
            Delete
          </Button>
          <Button
            className="w-[75px] shadow-none border"
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
}
