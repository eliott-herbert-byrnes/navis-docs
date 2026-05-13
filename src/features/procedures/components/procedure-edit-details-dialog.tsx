"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProcedureDetails } from "../hooks/use-procedure-mutations";
import { Loader2 } from "lucide-react";

type ProcedureEditDetailsDialogProps = {
  procedureId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  initialDescription: string;
  disabled?: boolean;
  onSuccess: (details: { title: string; description: string }) => void;
};

export function ProcedureEditDetailsDialog({
  procedureId,
  open,
  onOpenChange,
  initialTitle,
  initialDescription,
  disabled = false,
  onSuccess,
}: ProcedureEditDetailsDialogProps) {
  const { updateProcedureDetails, isPending } = useUpdateProcedureDetails();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  }, [open, initialTitle, initialDescription]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled || isPending) return;

    const procedureTitle = title.trim();
    const procedureDescription = description.trim();

    updateProcedureDetails(
      {
        procedureId,
        procedureTitle,
        procedureDescription,
      },
      {
        onSuccess: () => {
          onSuccess({
            title: procedureTitle,
            description: procedureDescription,
          });
          onOpenChange(false);
        },
      },
    );
  };

  const formDisabled = disabled || isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit details</DialogTitle>
            <DialogDescription>
              Update the procedure title and description shown in the header.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4 py-2">
            <Field>
              <FieldLabel htmlFor="edit-procedure-title">Title</FieldLabel>
              <Input
                id="edit-procedure-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                disabled={formDisabled}
                className="shadow-none border"
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-procedure-description">
                Description
              </FieldLabel>
              <Textarea
                id="edit-procedure-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                disabled={formDisabled}
                className="shadow-none border resize-y min-h-[96px]"
              />
            </Field>
          </FieldGroup>
          <DialogFooter className=" flex gap-2">
            <Button type="submit" disabled={formDisabled}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
                  Save
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
