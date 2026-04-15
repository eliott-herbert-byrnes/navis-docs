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

type ChatDeleteDialogProps = {
  title: string;
  description: string;
  isPending: boolean;
  onConfirm: () => void;
};
const ChatDeleteDialog = ({
  title,
  description,
  isPending,
  onConfirm,
}: ChatDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AccessDialogTrigger>
        <Button
          onClick={() => setOpen}
          variant="destructive"
          size="icon"
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AccessDialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-red-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            isLoading={isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ChatDeleteDialog };
