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

type DepartmentDeleteDialogSettingsProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
};
const DepartmentDeleteDialogSettings = ({
  title,
  description,
  onConfirm,
  isPending,
}: DepartmentDeleteDialogSettingsProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AccessDialogTrigger adminOnly>
        <Button
          className="flex w-38"
          variant="destructive"
          disabled={isPending}
        >
          <TrashIcon className="w-4 h-4" />
          Delete
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
};

export { DepartmentDeleteDialogSettings };
