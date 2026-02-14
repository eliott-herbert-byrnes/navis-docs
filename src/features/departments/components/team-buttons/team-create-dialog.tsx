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
import { Input } from "@/components/ui/input";
import { Loader2, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CreateTeamDialogProps = {
  title: string;
  description: string;
  onConfirm: (teamName: string) => void;
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled: boolean;
};
const CreateTeamDialog = ({
  title,
  description,
  disabled,
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
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full max-w-[125px]"
        >
          <PlusIcon className="w-4 h-4" />
          Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <Input
            id="teamName"
            name="teamName"
            type="text"
            placeholder="Team Name"
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
            disabled={isPending || !teamName.trim()}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { CreateTeamDialog };
