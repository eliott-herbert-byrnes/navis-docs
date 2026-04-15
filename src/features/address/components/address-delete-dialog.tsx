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
import { Trash2 } from "lucide-react";
import { useState } from "react";

type AddressDeleteDialogProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
};

const AddressDeleteDialog = ({
  title,
  description,
  onConfirm,
  isPending,
}: AddressDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AccessDialogTrigger adminOnly>
        <Button variant="ghost" className="w-full flex justify-start gap-4">
          <Trash2 className="w-4 h-4 text-muted-foreground" />
          <span className="font-normal">Delete</span>
        </Button>
      </AccessDialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            className="w-[75px]"
            type="button"
            variant="default"
            onClick={handleSubmit}
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

export { AddressDeleteDialog };
