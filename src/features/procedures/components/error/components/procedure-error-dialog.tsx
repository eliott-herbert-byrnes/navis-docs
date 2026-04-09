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
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { useState, FormEvent } from "react";

type ProcedureErrorDialogProps = {
  procedureId: string;
  title: string;
  description: string;
  onSubmit: (data: { procedureId: string; errorReport: string }) => void;
  isPending: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ProcedureErrorDialog = ({
  procedureId,
  title,
  description,
  onSubmit,
  isPending,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProcedureErrorDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onSubmit({
      procedureId,
      errorReport: String(formData.get("errorReport") ?? "").trim(),
    });

    setOpen(false);

    e.currentTarget.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" className="m-0 p-0 justify-start rounded-none">
            <Flag className="w-4 h-4 text-muted-foreground" />
            <span className="font-normal ml-1">Report</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Textarea
            name="errorReport"
            placeholder="Describe the issue with this procedure..."
            required
            rows={10}
            disabled={isPending}
            maxLength={1000}
          />
          <DialogFooter className="flex flex-row gap-2 mt-4">
            <Button className="w-[75px]" type="submit" isLoading={isPending}>
              Report
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
        </form>
      </DialogContent>
    </Dialog>
  );
};