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
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { useDeleteOrg } from "../hooks/use-org-mutations";

const OrganizationDeleteButton = () => {
  // const [open, setOpen] = useState(false);
  const { open, setOpen, deleteOrganization, isPending } =
    useDeleteOrg();

  const handleDelete = () => {
    deleteOrganization();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex justify-start gap-4">
          <Trash className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">Delete Organization</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Organization</DialogTitle>
          <DialogDescription className="text-red-600">Are you sure you want to complete this action? It cannot be undone.</DialogDescription>
        </DialogHeader>
        <Separator />
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
            onClick={handleDelete}
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

export { OrganizationDeleteButton };
