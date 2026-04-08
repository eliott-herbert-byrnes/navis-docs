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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shadow-none">
          <PlusIcon className="w-4 h-4" />
          Invite Team Member
        </Button>
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
              onClick={() => { setOpen(false); setEmail(""); }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button className="w-[75px]" type="submit" disabled={isPending}>
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
