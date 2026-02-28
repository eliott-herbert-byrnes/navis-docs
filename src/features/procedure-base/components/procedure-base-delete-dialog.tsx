"use client";

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
import { Loader2, TrashIcon } from "lucide-react";
import { useState } from "react";

type ProcedureBaseDeleteDialogProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
  /** When provided, dialog is controlled and no trigger is rendered (for use in dropdowns etc.) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const ProcedureBaseDeleteDialog = ({
  title,
  description,
  onConfirm,
  isPending,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProcedureBaseDeleteDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleClose = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-start gap-4">
            <TrashIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-normal">Delete</span>
          </Button>
        </DialogTrigger>
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
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="w-[75px]"
            type="button"
            variant="default"
            onClick={handleClose}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ProcedureBaseDeleteDialog };
