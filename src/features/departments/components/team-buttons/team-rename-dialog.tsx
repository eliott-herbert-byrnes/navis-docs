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
import { Input } from "@/components/ui/input";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

type TeamRenameDialogProps = {
  title: string;
  description: string;
  onConfirm: (newTeamName: string) => void;
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
};
const TeamRenameDialog = ({
  title,
  description,
  onConfirm,
  isPending,
  teamName,
  open,
  onOpenChange,
}: TeamRenameDialogProps) => {
  const [newTeamName, setnewTeamName] = useState("");

  const handleConfirm = () => {
    const trimmedNewTeamName = newTeamName.trim();
    if (!trimmedNewTeamName) {
      return;
    }
    if (trimmedNewTeamName === teamName) {
      return;
    }
    onConfirm(trimmedNewTeamName);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setnewTeamName("");
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AccessDialogTrigger adminOnly>
        <Button
          variant="ghost"
          className="w-full max-w-[125px] rounded-none border-b-1"
        >
          <PencilIcon className="w-4 h-4" />
          Rename
        </Button>
      </AccessDialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <Input
            id="newTeamName"
            name="newTeamName"
            type="text"
            placeholder={teamName}
            value={newTeamName}
            onChange={(e) => setnewTeamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isPending) {
                handleConfirm();
              }
            }}
            disabled={isPending}
            required
          />
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            className="w-[75px]"
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="w-[75px]"
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={!teamName.trim() || newTeamName.trim() === teamName}
            isLoading={isPending}
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { TeamRenameDialog };
