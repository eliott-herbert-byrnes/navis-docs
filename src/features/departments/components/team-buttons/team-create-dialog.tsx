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
import { Separator } from "@radix-ui/react-separator";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CreateTeamDialogProps = {
  title: string;
  description: string;
  onConfirm: (teamName: string) => void;
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
const CreateTeamDialog = ({
  title,
  description,
  onConfirm,
  isPending,
  open,
  onOpenChange,
}: CreateTeamDialogProps) => {
  const [teamName, setTeamName] = useState("");

  const handleConfirm = () => {
    const trimmedTeamName = teamName.trim();
    if (!trimmedTeamName) {
      toast.error("Team name is required, enter a name");
      return;
    }
    onConfirm(trimmedTeamName);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setTeamName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AccessDialogTrigger adminOnly>
        <Button
          variant="ghost"
          className="rounded-none justify-start font-normal"
        >
          <div className="flex flex-row gap-2 items-center">
            <PlusIcon className="w-4 h-4" />
            Team
          </div>
        </Button>
      </AccessDialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <Input
            id="teamName"
            name="teamName"
            type="text"
            placeholder="Team Name"
            className="shadow-none border w-2/3 mt-2"
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirm();
              }
            }}
            disabled={isPending}
          />
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <Button
            className="w-[75px] shadow-none border"
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={!teamName.trim()}
            isLoading={isPending}
          >
            Add
          </Button>
          <Button
            className="w-[75px] shadow-none border"
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { CreateTeamDialog };
