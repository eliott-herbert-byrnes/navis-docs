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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OrgMembershipRole } from "@prisma/client";
import { Loader2, UserIcon } from "lucide-react";
import { useState } from "react";

type UserRoleChangeDialogProps = {
  title: string;
  description: string;
  currentRole: OrgMembershipRole;
  onConfirm: (newRole: OrgMembershipRole) => void;
  isPending: boolean;
};
const UserRoleChangeDialog = ({
  title,
  description,
  currentRole,
  onConfirm,
  isPending,
}: UserRoleChangeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(
    currentRole.toLowerCase()
  );

  const handleClose = () => {
    const newRole = selectedRole.toUpperCase() as OrgMembershipRole;
    onConfirm(newRole);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full flex justify-start gap-4">
          <UserIcon className="w-4 h-4 text-muted-foreground" />
          <span className="font-normal">Change Role</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Separator />
        <Select
          name="role"
          defaultValue="member"
          onValueChange={setSelectedRole}
        >
          <SelectTrigger className="mt-4">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
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
            onClick={handleClose}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { UserRoleChangeDialog };
