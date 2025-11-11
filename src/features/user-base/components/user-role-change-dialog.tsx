"use client";
import { Form } from "@/components/form/form";
import { ActionState } from "@/components/form/utils/to-action-state";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/features/invite/components/submit-button";
import { UserIcon } from "lucide-react";
import { useState } from "react";

type UserRoleChangeDialogProps = {
  title: string;
  description: string;
  action: (payload: FormData) => void;
  actionState: ActionState;
  userId: string;
};
const UserRoleChangeDialog = ({
  title,
  description,
  action,
  actionState,
  userId,
}: UserRoleChangeDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
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
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleClose}
          onError={handleClose}
        >
          <input type="hidden" name="userId" value={userId} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4"/>
          <Select name="role" defaultValue="member" >
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
              onClick={handleClose}
            >
              Cancel
            </Button>
            <SubmitButton label="Change Role" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { UserRoleChangeDialog };
