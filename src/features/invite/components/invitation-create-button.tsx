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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCreateInvitation } from "../hooks/use-invite-mutations";

const InvitationCreateButton = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { createInvitation, isPending } = useCreateInvitation(() => {
    setOpen(false);
    setEmail("");
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvitation(email);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button variant="outline" disabled>
                <PlusIcon className="w-4 h-4" />
                Invite Team Member
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disabled for MVP</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a team member to your organization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
          />
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
              type="submit"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { InvitationCreateButton };
