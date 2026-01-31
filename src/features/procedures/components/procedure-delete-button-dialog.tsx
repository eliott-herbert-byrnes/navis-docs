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
import { useAuthContext } from "@/contexts/auth-context";
import { Loader2, TrashIcon } from "lucide-react";
import { useState } from "react";

type ProcedureDeleteButtonDialogProps = {
  title: string;
  description: string;
  isPending: boolean;
  onConfirm: () => void;
};
const ProcedureDeleteButtonDialog = ({
  title,
  description,
  isPending,
  onConfirm,
}: ProcedureDeleteButtonDialogProps) => {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuthContext();

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={!isAdmin}>
          <TrashIcon className="h-4 w-4 mr-2" />
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
        </Button>
      </DialogTrigger>
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

export { ProcedureDeleteButtonDialog };
