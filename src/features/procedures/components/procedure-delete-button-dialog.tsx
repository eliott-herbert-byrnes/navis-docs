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
  /** When set with onOpenChange, omits the default trigger (e.g. open from a menu). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
const ProcedureDeleteButtonDialog = ({
  title,
  description,
  isPending,
  onConfirm,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: ProcedureDeleteButtonDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { isAdmin } = useAuthContext();

  const isControlled =
    typeof openProp === "boolean" && typeof onOpenChangeProp === "function";
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled ? (
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={!isAdmin}>
            <TrashIcon className="h-4 w-4 mr-2" />
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-red-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            variant="default"
            size="sm"
            className="shadow-none border"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
          <Button
            variant="outline"
            className="shadow-none border"
            size="sm"
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

export { ProcedureDeleteButtonDialog };
