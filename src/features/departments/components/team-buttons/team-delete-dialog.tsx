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

type TeamDeleteDialogProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
const TeamDeleteDialog = ({
  title,
  description,
  onConfirm,
  isPending,
  open,
  onOpenChange,
}: TeamDeleteDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
  };
  const { isAdmin } = useAuthContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full max-w-[125px]"
          disabled={!isAdmin}
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            className="w-[75px]"
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="w-[75px]"
            type="button"
            variant="default"
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

export { TeamDeleteDialog };
