"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, TrashIcon } from "lucide-react";
import { useDeleteProcedureFromBase } from "../hook/use-procedure-base-mutations";
import { ProcedureBaseDeleteDialog } from "./procedure-base-delete-dialog";

type ProcedureBaseDeleteButtonProps = {
  procedureId: string;
  onSuccess?: () => void;
  variant?: "ghost" | "outline";
  size?: "sm" | "default" | "icon";
};

const ProcedureBaseDeleteButton = ({
  procedureId,
  onSuccess,
  variant = "ghost",
  size = "default",
}: ProcedureBaseDeleteButtonProps) => {
  const [open, setOpen] = useState(false);
  const { deleteProcedure, isPending } = useDeleteProcedureFromBase({
    onSuccess,
  });

  const handleDelete = async () => {
    await deleteProcedure(procedureId);
  };

  const isCustomTrigger = variant === "outline";

  const dialog = (
    <ProcedureBaseDeleteDialog
      title="Are you sure you want to delete this procedure?"
      description="This action cannot be undone."
      onConfirm={handleDelete}
      isPending={isPending}
      {...(isCustomTrigger && { open, onOpenChange: setOpen })}
    />
  );

  if (isCustomTrigger) {
    return (
      <>
        <Button
          type="button"
          variant="destructive"
          size={size}
          onClick={() => setOpen(true)}
          disabled={isPending}
          aria-label="Delete this procedure"
          className="shadow-none"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TrashIcon className="w-4 h-4 mr-2" />
          )}
          Delete
        </Button>
        {dialog}
      </>
    );
  }

  return dialog;
};

export { ProcedureBaseDeleteButton };
